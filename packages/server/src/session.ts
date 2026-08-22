import { watch } from "chokidar";
import { createServer } from "node:http";
import { extname, join, relative, resolve } from "node:path";
import { WebSocketServer, type WebSocket } from "ws";
import { extractAllStories, extractStoryFile } from "./extractor.ts";
import { invalidateFor } from "./invalidate.ts";
import { compileStory } from "./render.ts";
import type {
  ClientMessage,
  FileError,
  ServerMessage,
  StoryIR,
} from "./types.ts";
import { isStoryFile, mergeStoryArgs, toPosix } from "./ir.ts";
import { isBuiltUi, resolveUiRoot } from "./paths.ts";
import { isPreviewPath } from "./preview.ts";
import { serveStatic } from "./static.ts";
import { ensureHelperPackagePath, requireTypstBinary } from "./typst.ts";

const WORKBENCH_WS_PATH = "/__typstbook_ws";
const COMPILE_DEBOUNCE_MS = 80;

/** Per-tab state. Each browser tab gets its own selection/args/compile queue. */
type ClientSession = {
  readonly socket: WebSocket;
  selectedId: string | null;
  readonly argsById: Map<string, Record<string, unknown>>;
  readonly lastGoodPages: Map<string, string[]>;
  compiling: boolean;
  compileQueued: boolean;
  compileTimer: ReturnType<typeof setTimeout> | null;
};

function createSession(socket: WebSocket): ClientSession {
  return {
    socket,
    selectedId: null,
    argsById: new Map(),
    lastGoodPages: new Map(),
    compiling: false,
    compileQueued: false,
    compileTimer: null,
  };
}

export type WorkbenchOptions = {
  packageRoot: string;
  port?: number;
};

export class Workbench {
  private readonly packageRoot: string;
  private readonly port: number;
  private typst = "";
  private packagePath = "";
  private stories: StoryIR[] = [];
  private errors: FileError[] = [];
  private readonly sessions = new Map<WebSocket, ClientSession>();
  private httpServer: ReturnType<typeof createServer> | null = null;
  private wss: WebSocketServer | null = null;
  private watcher: ReturnType<typeof watch> | null = null;

  constructor(options: WorkbenchOptions) {
    this.packageRoot = resolve(options.packageRoot);
    this.port = options.port ?? 4400;
  }

  async start(): Promise<string> {
    this.typst = await requireTypstBinary();
    this.packagePath = await ensureHelperPackagePath();
    await this.reloadAll();

    const httpServer = createServer();
    this.httpServer = httpServer;
    const uiRoot = resolveUiRoot();
    if (isBuiltUi(uiRoot)) {
      httpServer.on("request", (req, res) => {
        serveStatic(uiRoot, req, res);
      });
    } else {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        root: uiRoot,
        configFile: join(uiRoot, "vite.config.ts"),
        server: {
          middlewareMode: true,
          // Keep Vite HMR off `/ws` — that path used to collide with our socket
          // and caused endless full-page reloads ("server connection lost").
          hmr: {
            server: httpServer,
            path: "/vite-hmr",
          },
        },
        appType: "spa",
      });
      httpServer.on("request", (req, res) => {
        vite.middlewares(req, res);
      });
    }

    const wss = new WebSocketServer({ noServer: true });
    this.wss = wss;
    httpServer.on("upgrade", (request, socket, head) => {
      const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
      if (pathname !== WORKBENCH_WS_PATH) {
        return;
      }
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    });

    wss.on("connection", (socket) => {
      const session = createSession(socket);
      this.sessions.set(socket, session);
      this.send(socket, {
        type: "stories",
        stories: this.stories,
        errors: this.errors,
      });
      socket.on("message", (data) => {
        this.onClientMessage(session, String(data));
      });
      socket.on("close", () => {
        if (session.compileTimer) {
          clearTimeout(session.compileTimer);
        }
        this.sessions.delete(socket);
      });
    });

    this.watchFiles();

    await new Promise<void>((resolveListen) => {
      httpServer.listen(this.port, resolveListen);
    });
    const address = httpServer.address();
    const boundPort =
      address && typeof address === "object" ? address.port : this.port;
    return `http://127.0.0.1:${boundPort}`;
  }

  async stop(): Promise<void> {
    await this.watcher?.close();
    for (const session of this.sessions.values()) {
      session.socket.terminate();
    }
    this.sessions.clear();
    this.wss?.close();
    await new Promise<void>((resolveClose) => {
      if (!this.httpServer) {
        resolveClose();
        return;
      }
      this.httpServer.close(() => resolveClose());
    });
  }

  private watchFiles(): void {
    const watcher = watch(this.packageRoot, {
      ignoreInitial: true,
      ignored: (path) =>
        path.includes("node_modules") ||
        path.includes(`${join(this.packageRoot, ".git")}`) ||
        path.includes("/.git/"),
    });
    this.watcher = watcher;

    const handle = (fullPath: string) => {
      const rel = toPosix(relative(this.packageRoot, fullPath));
      if (rel.startsWith("..")) {
        return;
      }
      const ext = extname(fullPath);
      const reason =
        rel === "typst.toml" ||
        rel.endsWith("/typst.toml") ||
        isPreviewPath(rel)
          ? "config"
          : isStoryFile(rel)
            ? "story-file"
            : ext === ".typ"
              ? "source"
              : null;
      if (!reason) {
        return;
      }
      void this.handleInvalidate(reason, rel);
    };

    watcher.on("add", handle);
    watcher.on("change", handle);
    watcher.on("unlink", handle);
  }

  private async handleInvalidate(
    reason: "story-file" | "source" | "config",
    file: string,
  ): Promise<void> {
    const action = invalidateFor(reason);
    switch (action) {
      case "compile":
        this.scheduleCompileAll();
        break;
      case "extract-file":
        await this.reloadFile(file);
        this.scheduleCompileAll();
        break;
      case "extract-all":
        await this.reloadAll();
        this.scheduleCompileAll();
        break;
      default: {
        const _exhaustive: never = action;
        return _exhaustive;
      }
    }
  }

  private onClientMessage(session: ClientSession, raw: string): void {
    let message: ClientMessage;
    try {
      message = JSON.parse(raw) as ClientMessage;
    } catch {
      return;
    }
    switch (message.type) {
      case "select":
        session.selectedId = message.storyId;
        {
          const story = this.stories.find((item) => item.id === message.storyId);
          if (story) {
            session.argsById.set(
              message.storyId,
              mergeStoryArgs(story.args, session.argsById.get(message.storyId)),
            );
          }
        }
        this.scheduleCompile(session);
        break;
      case "set-args":
        session.argsById.set(message.storyId, message.args);
        if (session.selectedId === message.storyId) {
          this.scheduleCompile(session);
        }
        break;
      default: {
        const _exhaustive: never = message;
        return _exhaustive;
      }
    }
  }

  private async reloadAll(): Promise<void> {
    const extracted = await extractAllStories({
      typst: this.typst,
      packageRoot: this.packageRoot,
      packagePath: this.packagePath,
    });
    this.stories = extracted.stories;
    this.errors = extracted.errors;
    this.syncAllSessions();
    this.broadcast({
      type: "stories",
      stories: this.stories,
      errors: this.errors,
    });
  }

  private async reloadFile(file: string): Promise<void> {
    if (!isStoryFile(file)) {
      await this.reloadAll();
      return;
    }
    const extracted = await extractStoryFile(
      {
        typst: this.typst,
        packageRoot: this.packageRoot,
        packagePath: this.packagePath,
      },
      file,
    );
    this.stories = [
      ...this.stories.filter((story) => story.file !== file),
      ...extracted.stories,
    ];
    this.errors = [
      ...this.errors.filter((error) => error.file !== file),
      ...extracted.errors,
    ];
    this.syncAllSessions();
    this.broadcast({
      type: "stories",
      stories: this.stories,
      errors: this.errors,
    });
  }

  private syncAllSessions(): void {
    for (const session of this.sessions.values()) {
      this.syncSessionArgs(session);
    }
  }

  private syncSessionArgs(session: ClientSession): void {
    const ids = new Set(this.stories.map((story) => story.id));
    for (const id of session.argsById.keys()) {
      if (!ids.has(id)) {
        session.argsById.delete(id);
        session.lastGoodPages.delete(id);
      }
    }
    for (const story of this.stories) {
      session.argsById.set(
        story.id,
        mergeStoryArgs(story.args, session.argsById.get(story.id)),
      );
    }
    if (session.selectedId && !ids.has(session.selectedId)) {
      session.selectedId = this.stories[0]?.id ?? null;
    }
  }

  private scheduleCompileAll(): void {
    for (const session of this.sessions.values()) {
      this.scheduleCompile(session);
    }
  }

  private scheduleCompile(session: ClientSession): void {
    if (session.compileTimer) {
      clearTimeout(session.compileTimer);
    }
    session.compileTimer = setTimeout(() => {
      session.compileTimer = null;
      void this.compileSelected(session);
    }, COMPILE_DEBOUNCE_MS);
  }

  private async compileSelected(session: ClientSession): Promise<void> {
    if (!session.selectedId) {
      return;
    }
    if (session.compiling) {
      session.compileQueued = true;
      return;
    }
    session.compiling = true;
    const storyId = session.selectedId;
    try {
      const story = this.stories.find((item) => item.id === storyId);
      if (!story) {
        this.send(session.socket, {
          type: "preview-error",
          storyId,
          diagnostics: [`Unknown story: ${storyId}`],
          lastGoodPages: session.lastGoodPages.get(storyId) ?? [],
        });
        return;
      }
      const args = mergeStoryArgs(story.args, session.argsById.get(storyId));
      session.argsById.set(storyId, args);
      const compiled = await compileStory(
        {
          typst: this.typst,
          packageRoot: this.packageRoot,
          packagePath: this.packagePath,
        },
        {
          file: story.file,
          title: story.title,
          args,
          page: story.page,
        },
      );
      if (compiled.pages.length === 0) {
        this.send(session.socket, {
          type: "preview-error",
          storyId,
          diagnostics: compiled.diagnostics,
          lastGoodPages: session.lastGoodPages.get(storyId) ?? [],
        });
        return;
      }
      session.lastGoodPages.set(storyId, compiled.pages);
      this.send(session.socket, {
        type: "preview",
        storyId,
        pages: compiled.pages,
        diagnostics: compiled.diagnostics,
      });
    } finally {
      session.compiling = false;
      if (session.compileQueued) {
        session.compileQueued = false;
        void this.compileSelected(session);
      }
    }
  }

  private broadcast(message: ServerMessage): void {
    for (const session of this.sessions.values()) {
      this.send(session.socket, message);
    }
  }

  private send(client: WebSocket, message: ServerMessage): void {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}
