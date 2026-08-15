import { useCallback, useEffect, useRef, useState } from "react";
import {
  mergeStoryArgs,
  type ClientMessage,
  type FileError,
  type ServerMessage,
  type StoryIR,
} from "@/lib/types";

export type WorkbenchState = {
  stories: StoryIR[];
  errors: FileError[];
  selectedId: string | null;
  args: Record<string, unknown>;
  pages: string[];
  lastGoodPages: string[];
  diagnostics: string[];
  previewError: boolean;
  zoom: number;
  pageIndex: number;
  connected: boolean;
};

function setPath(id: string): void {
  const url = new URL(location.href);
  url.searchParams.set("path", id);
  history.replaceState(null, "", url);
}

function argsEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.every((key) => Object.is(a[key], b[key]));
}

export function useWorkbench() {
  const [state, setState] = useState<WorkbenchState>(() => ({
    stories: [],
    errors: [],
    selectedId: new URLSearchParams(location.search).get("path"),
    args: {},
    pages: [],
    lastGoodPages: [],
    diagnostics: [],
    previewError: false,
    zoom: 1,
    pageIndex: 0,
    connected: false,
  }));
  const socketRef = useRef<WebSocket | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const bootstrappedRef = useRef(false);

  const send = useCallback((message: ClientMessage) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }, []);

  const selectStory = useCallback(
    (id: string, resetArgs = true) => {
      const story = stateRef.current.stories.find((item) => item.id === id);
      if (!story) {
        return;
      }
      setPath(id);
      setState((prev) => ({
        ...prev,
        selectedId: id,
        args: resetArgs ? { ...story.args } : prev.args,
        pageIndex: 0,
      }));
      send({ type: "select", storyId: id });
    },
    [send],
  );

  const setArg = useCallback(
    (name: string, value: unknown) => {
      setState((prev) => {
        if (!prev.selectedId) {
          return prev;
        }
        const args = { ...prev.args, [name]: value };
        send({ type: "set-args", storyId: prev.selectedId, args });
        return { ...prev, args };
      });
    },
    [send],
  );

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({
      ...prev,
      zoom: Math.min(3, Math.max(0.25, zoom)),
    }));
  }, []);

  const setPageIndex = useCallback((pageIndex: number) => {
    setState((prev) => ({ ...prev, pageIndex }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    bootstrappedRef.current = false;
    const socket = new WebSocket(
      `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/__typstbook_ws`,
    );
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      if (cancelled) {
        return;
      }
      setState((prev) => ({ ...prev, connected: true }));
    });

    socket.addEventListener("close", () => {
      if (cancelled) {
        return;
      }
      setState((prev) => ({ ...prev, connected: false }));
    });

    socket.addEventListener("message", (event) => {
      if (cancelled) {
        return;
      }
      const message = JSON.parse(String(event.data)) as ServerMessage;
      switch (message.type) {
        case "stories": {
          setState((prev) => {
            const stories = message.stories;
            const errors = message.errors;
            const selectedStillExists =
              prev.selectedId !== null &&
              stories.some((story) => story.id === prev.selectedId);

            if (!selectedStillExists) {
              const first = stories[0];
              if (first) {
                setPath(first.id);
                bootstrappedRef.current = true;
                queueMicrotask(() => {
                  if (!cancelled) {
                    send({ type: "select", storyId: first.id });
                  }
                });
                return {
                  ...prev,
                  stories,
                  errors,
                  selectedId: first.id,
                  args: { ...first.args },
                  pageIndex: 0,
                };
              }
              return {
                ...prev,
                stories,
                errors,
                selectedId: null,
                args: {},
              };
            }

            const current = stories.find(
              (story) => story.id === prev.selectedId,
            );
            if (!current || !prev.selectedId) {
              return { ...prev, stories, errors };
            }

            const args = mergeStoryArgs(current.args, prev.args);
            // File-watch re-extract already compiles on the server. Only ask
            // for a compile when we still need the first preview, or when
            // defaults gained/lost keys that the live args must pick up.
            const needsBootstrap = !bootstrappedRef.current;
            const argKeysChanged = !argsEqual(args, prev.args);
            if (needsBootstrap || argKeysChanged) {
              bootstrappedRef.current = true;
              const storyId = prev.selectedId;
              queueMicrotask(() => {
                if (cancelled) {
                  return;
                }
                if (argKeysChanged) {
                  send({ type: "set-args", storyId, args });
                } else {
                  send({ type: "select", storyId });
                }
              });
            }

            return { ...prev, stories, errors, args };
          });
          break;
        }
        case "preview":
          setState((prev) => {
            if (message.storyId !== prev.selectedId) {
              return prev;
            }
            const samePages =
              prev.pages.length === message.pages.length &&
              prev.pages.every((page, i) => page === message.pages[i]);
            if (
              samePages &&
              !prev.previewError &&
              prev.diagnostics.length === message.diagnostics.length &&
              prev.diagnostics.every((d, i) => d === message.diagnostics[i])
            ) {
              return prev;
            }
            return {
              ...prev,
              pages: message.pages,
              lastGoodPages: message.pages,
              diagnostics: message.diagnostics,
              previewError: false,
              pageIndex: Math.min(
                prev.pageIndex,
                Math.max(0, message.pages.length - 1),
              ),
            };
          });
          break;
        case "preview-error":
          setState((prev) => {
            if (message.storyId !== prev.selectedId) {
              return prev;
            }
            return {
              ...prev,
              diagnostics: message.diagnostics,
              lastGoodPages: message.lastGoodPages,
              previewError: true,
            };
          });
          break;
        default: {
          const _exhaustive: never = message;
          return _exhaustive;
        }
      }
    });

    return () => {
      cancelled = true;
      socket.close();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [send]);

  return {
    state,
    selectStory,
    setArg,
    setZoom,
    setPageIndex,
  };
}
