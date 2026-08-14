import { watch } from "chokidar";
import { createServer } from "node:http";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
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
import { toPosix } from "./ir.ts";
import { isPreviewPath } from "./preview.ts";
import { ensureHelperPackagePath, requireTypstBinary } from "./typst.ts";

const uiRoot = fileURLToPath(new URL("../../ui", import.meta.url));

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
  private readonly argsById = new Map<string, Record<string, unknown>>();
  private readonly lastGoodPages = new Map<string, string[]>();
  private selectedId: string | null = null;
  private readonly clients = new Set<WebSocket>();
  private compiling = false;
  private compileQueued = false;

  constructor(options: WorkbenchOptions) {
    this.packageRoot = resolve(options.packageRoot);
    this.port = options.port ?? 4400;
  }

  async start(): Promise<string> {
    this.typst = await requireTypstBinary();
    this.packagePath = await ensureHelperPackagePath();
    await this.reloadAll();

    const vite = await createViteServer({
      root: uiRoot,
      configFile: join(uiRoot, "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
    });

    const httpServer = createServer((req, res) => {
      vite.middlewares(req, res);
    });
    const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
    wss.on("connection", (socket) => {
      this.clients.add(socket);
      this.send(socket, {
        type: "stories",
        stories: this.stories,
        errors: this.errors,
      });
      if (this.selectedId) {
        void this.compileSelected();
      }
      socket.on("message", (data) => {
        this.onClientMessage(String(data));
      });
      socket.on("close", () => {
        this.clients.delete(socket);
      });
    });

    this.watchFiles();

    await new Promise<void>((resolveListen) => {
      httpServer.listen(this.port, resolveListen);
    });
    return `http://127.0.0.1:${this.port}`;
  }

  private watchFiles(): void {
    const watcher = watch(this.packageRoot, {
      ignoreInitial: true,
      ignored: (path) =>
        path.includes("node_modules") ||
        path.includes(`${join(this.packageRoot, ".git")}`) ||
        path.includes("/.git/"),
    });

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
          : rel.endsWith(".story.typ")
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
        await this.compileSelected();
        break;
      case "extract-file":
        await this.reloadFile(file);
        await this.compileSelected();
        break;
      case "extract-all":
        await this.reloadAll();
        await this.compileSelected();
        break;
      default: {
        const _exhaustive: never = action;
        return _exhaustive;
      }
    }
  }

  private onClientMessage(raw: string): void {
    let message: ClientMessage;
    try {
      message = JSON.parse(raw) as ClientMessage;
    } catch {
      return;
    }
    switch (message.type) {
      case "select":
        this.selectedId = message.storyId;
        if (!this.argsById.has(message.storyId)) {
          const story = this.stories.find((item) => item.id === message.storyId);
          if (story) {
            this.argsById.set(message.storyId, { ...story.args });
          }
        }
        void this.compileSelected();
        break;
      case "set-args":
        this.argsById.set(message.storyId, message.args);
        if (this.selectedId === message.storyId) {
          void this.compileSelected();
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
    this.syncArgs();
    this.broadcast({
      type: "stories",
      stories: this.stories,
      errors: this.errors,
    });
  }

  private async reloadFile(file: string): Promise<void> {
    if (!file.endsWith(".story.typ")) {
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
    this.syncArgs();
    this.broadcast({
      type: "stories",
      stories: this.stories,
      errors: this.errors,
    });
  }

  private syncArgs(): void {
    const ids = new Set(this.stories.map((story) => story.id));
    for (const id of this.argsById.keys()) {
      if (!ids.has(id)) {
        this.argsById.delete(id);
        this.lastGoodPages.delete(id);
      }
    }
    if (this.selectedId && !ids.has(this.selectedId)) {
      this.selectedId = this.stories[0]?.id ?? null;
    }
  }

  private async compileSelected(): Promise<void> {
    if (!this.selectedId) {
      return;
    }
    if (this.compiling) {
      this.compileQueued = true;
      return;
    }
    this.compiling = true;
    const storyId = this.selectedId;
    try {
      const story = this.stories.find((item) => item.id === storyId);
      if (!story) {
        this.broadcast({
          type: "preview-error",
          storyId,
          diagnostics: [`Unknown story: ${storyId}`],
          lastGoodPages: this.lastGoodPages.get(storyId) ?? [],
        });
        return;
      }
      const args = this.argsById.get(storyId) ?? { ...story.args };
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
        this.broadcast({
          type: "preview-error",
          storyId,
          diagnostics: compiled.diagnostics,
          lastGoodPages: this.lastGoodPages.get(storyId) ?? [],
        });
        return;
      }
      this.lastGoodPages.set(storyId, compiled.pages);
      this.broadcast({
        type: "preview",
        storyId,
        pages: compiled.pages,
        diagnostics: compiled.diagnostics,
      });
    } finally {
      this.compiling = false;
      if (this.compileQueued) {
        this.compileQueued = false;
        void this.compileSelected();
      }
    }
  }

  private broadcast(message: ServerMessage): void {
    for (const client of this.clients) {
      this.send(client, message);
    }
  }

  private send(client: WebSocket, message: ServerMessage): void {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}
