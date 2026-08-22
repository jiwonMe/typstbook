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

type StaticStory = StoryIR & { pages: string[]; diagnostics: string[] };
type StaticSiteData = { stories: StaticStory[]; errors: FileError[] };

declare global {
  interface Window {
    __TYPSTBOOK_STATIC__?: StaticSiteData;
  }
}

const STATIC_DATA: StaticSiteData | undefined =
  typeof window !== "undefined" ? window.__TYPSTBOOK_STATIC__ : undefined;
const STATIC_STORIES_BY_ID = new Map<string, StaticStory>(
  (STATIC_DATA?.stories ?? []).map((story) => [story.id, story]),
);

function syncUrl(id: string, args?: Record<string, unknown>): void {
  const url = new URL(location.href);
  url.searchParams.set("path", id);
  if (args) {
    url.searchParams.set("args", JSON.stringify(args));
  }
  history.replaceState(null, "", url);
}

function readArgsFromUrl(): Record<string, unknown> | null {
  const raw = new URLSearchParams(location.search).get("args");
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Malformed args in a shared/hand-edited URL; fall back to defaults.
  }
  return null;
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

function initialState(): WorkbenchState {
  if (STATIC_DATA) {
    const requestedId = new URLSearchParams(location.search).get("path");
    const initial =
      STATIC_STORIES_BY_ID.get(requestedId ?? "") ?? STATIC_DATA.stories[0];
    return {
      stories: STATIC_DATA.stories,
      errors: STATIC_DATA.errors,
      selectedId: initial?.id ?? null,
      args: initial ? { ...initial.args } : {},
      pages: initial?.pages ?? [],
      lastGoodPages: initial?.pages ?? [],
      diagnostics: initial?.diagnostics ?? [],
      previewError: false,
      zoom: 1,
      pageIndex: 0,
      connected: true,
    };
  }
  return {
    stories: [],
    errors: [],
    selectedId: new URLSearchParams(location.search).get("path"),
    args: readArgsFromUrl() ?? {},
    pages: [],
    lastGoodPages: [],
    diagnostics: [],
    previewError: false,
    zoom: 1,
    pageIndex: 0,
    connected: false,
  };
}

export function useWorkbench() {
  const [state, setState] = useState<WorkbenchState>(initialState);
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
      if (STATIC_DATA) {
        syncUrl(id);
        const staticStory = STATIC_STORIES_BY_ID.get(id);
        setState((prev) => ({
          ...prev,
          selectedId: id,
          args: resetArgs ? { ...story.args } : prev.args,
          pages: staticStory?.pages ?? [],
          lastGoodPages: staticStory?.pages ?? [],
          diagnostics: staticStory?.diagnostics ?? [],
          previewError: false,
          pageIndex: 0,
        }));
        return;
      }
      const args = resetArgs ? { ...story.args } : stateRef.current.args;
      syncUrl(id, args);
      setState((prev) => ({
        ...prev,
        selectedId: id,
        args,
        pageIndex: 0,
      }));
      send({ type: "select", storyId: id });
    },
    [send],
  );

  const setArg = useCallback(
    (name: string, value: unknown) => {
      if (STATIC_DATA) {
        return;
      }
      setState((prev) => {
        if (!prev.selectedId) {
          return prev;
        }
        const args = { ...prev.args, [name]: value };
        syncUrl(prev.selectedId, args);
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
    if (STATIC_DATA && stateRef.current.selectedId) {
      syncUrl(stateRef.current.selectedId);
    }
  }, []);

  useEffect(() => {
    if (STATIC_DATA) {
      return;
    }
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
                syncUrl(first.id, first.args);
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
              syncUrl(storyId, args);
              queueMicrotask(() => {
                if (cancelled) {
                  return;
                }
                if (needsBootstrap) {
                  // A brand-new server session has no args recorded for this
                  // story yet. "select" alone seeds it from bare defaults, so
                  // a URL-restored (or otherwise non-default) value must
                  // still follow as an explicit "set-args" -- comparing only
                  // against `prev.args` would skip it whenever the restored
                  // value already equals the merge result.
                  send({ type: "select", storyId });
                  if (!argsEqual(args, current.args)) {
                    send({ type: "set-args", storyId, args });
                  }
                } else if (argKeysChanged) {
                  send({ type: "set-args", storyId, args });
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
    readOnly: Boolean(STATIC_DATA),
  };
}
