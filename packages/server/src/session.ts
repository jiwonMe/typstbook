import { watch } from "chokidar";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, relative, resolve } from "node:path";
import { WebSocketServer, type WebSocket } from "ws";
import { acceptStorySnapshot, runPackageChecks } from "./checks.ts";
import { loadTypstbookConfig, type TypstbookConfig } from "./config.ts";
import { parseDiagnostics } from "./diagnostics.ts";
import { extractAllStories, extractStoryFile } from "./extractor.ts";
import { collectFontReport } from "./fonts.ts";
import { invalidateFor } from "./invalidate.ts";
import { openInEditor, vscodeFileUrl } from "./open-editor.ts";
import { compileStoryToPdf, watchWrapperSource } from "./render.ts";
import { discoverPackageTokens } from "./tokens.ts";
import { TypstPreviewWatch } from "./watch-preview.ts";
import type {
  ClientMessage,
  CompileRequest,
  FileError,
  FontReport,
  PackageToken,
  ServerMessage,
  StoryIR,
  ViewportSpec,
} from "./types.ts";
import { isStoryFile, mergeStoryArgs, titleSlug, toPosix } from "./ir.ts";
import { isBuiltUi, resolveUiRoot } from "./paths.ts";
import { hasPreviewFile, isPreviewPath } from "./preview.ts";
import { serveStatic } from "./static.ts";
import { ensureHelperPackagePath, requireTypstBinary } from "./typst.ts";

const WORKBENCH_WS_PATH = "/__typstbook_ws";
const WORKBENCH_PDF_PATH = "/__typstbook_pdf";
const WORKBENCH_OPEN_PATH = "/__typstbook_open";
const COMPILE_DEBOUNCE_MS = 80;

const EMPTY_FONTS: FontReport = { available: [], referenced: [], fontPaths: [] };

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolveBody(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

/** Per-tab state. Each browser tab gets its own selection/args/compile queue. */
type ClientSession = {
  readonly socket: WebSocket;
  selectedId: string | null;
  readonly argsById: Map<string, Record<string, unknown>>;
  readonly lastGoodPages: Map<string, string[]>;
  viewport: ViewportSpec | null;
  preview: TypstPreviewWatch | null;
  watchStoryId: string | null;
  compiling: boolean;
  compileQueued: boolean;
  compileRefresh: boolean;
  compileTimer: ReturnType<typeof setTimeout> | null;
};

function createSession(socket: WebSocket): ClientSession {
  return {
    socket,
    selectedId: null,
    argsById: new Map(),
    lastGoodPages: new Map(),
    viewport: null,
    preview: null,
    watchStoryId: null,
    compiling: false,
    compileQueued: false,
    compileRefresh: false,
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
  private config: TypstbookConfig = { fontPaths: [] };
  private stories: StoryIR[] = [];
  private errors: FileError[] = [];
  private tokens: PackageToken[] = [];
  private fonts: FontReport = EMPTY_FONTS;
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
    this.config = await loadTypstbookConfig(this.packageRoot);
    await this.reloadAll();

    const httpServer = createServer();
    this.httpServer = httpServer;
    const uiRoot = resolveUiRoot();
    let serveApp: (req: IncomingMessage, res: ServerResponse) => void;
    if (isBuiltUi(uiRoot)) {
      serveApp = (req, res) => serveStatic(uiRoot, req, res);
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
      serveApp = (req, res) => vite.middlewares(req, res);
    }
    httpServer.on("request", (req, res) => {
      const pathname = new URL(req.url ?? "/", "http://127.0.0.1").pathname;
      if (req.method === "POST" && pathname === WORKBENCH_PDF_PATH) {
        void this.handlePdfRequest(req, res);
        return;
      }
      if (req.method === "POST" && pathname === WORKBENCH_OPEN_PATH) {
        void this.handleOpenRequest(req, res);
        return;
      }
      serveApp(req, res);
    });

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
        tokens: this.tokens,
        fonts: this.fonts,
      });
      socket.on("message", (data) => {
        this.onClientMessage(session, String(data));
      });
      socket.on("close", () => {
        if (session.compileTimer) {
          clearTimeout(session.compileTimer);
        }
        void session.preview?.stop();
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

  private async handleOpenRequest(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    let body: { file?: string; line?: number | null; column?: number | null };
    try {
      body = JSON.parse(await readRequestBody(req)) as typeof body;
    } catch {
      sendJson(res, 400, { ok: false, detail: "malformed open request" });
      return;
    }
    if (!body.file || typeof body.file !== "string") {
      sendJson(res, 400, { ok: false, detail: "file is required" });
      return;
    }
    const request = {
      file: body.file,
      line: typeof body.line === "number" ? body.line : null,
      column: typeof body.column === "number" ? body.column : null,
    };
    const opened = openInEditor(this.packageRoot, request);
    sendJson(res, opened.ok ? 200 : 422, {
      ...opened,
      vscodeUrl: vscodeFileUrl(this.packageRoot, request),
    });
  }

  private async handlePdfRequest(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    let request: CompileRequest;
    try {
      request = JSON.parse(await readRequestBody(req)) as CompileRequest;
    } catch {
      sendJson(res, 400, { diagnostics: ["typstbook: malformed PDF export request."] });
      return;
    }
    try {
      const compiled = await compileStoryToPdf(
        {
          typst: this.typst,
          packageRoot: this.packageRoot,
          packagePath: this.packagePath,
          fontPaths: this.config.fontPaths,
        },
        request,
      );
      if (!compiled.pdf) {
        sendJson(res, 422, { diagnostics: compiled.diagnostics });
        return;
      }
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${titleSlug(request.title)}.pdf"`,
        "Content-Length": compiled.pdf.length,
      });
      res.end(compiled.pdf);
    } catch (error) {
      sendJson(res, 500, {
        diagnostics: [error instanceof Error ? error.message : String(error)],
      });
    }
  }

  async stop(): Promise<void> {
    await this.watcher?.close();
    for (const session of this.sessions.values()) {
      if (session.compileTimer) {
        clearTimeout(session.compileTimer);
      }
      await session.preview?.stop();
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
        path.includes("/.git/") ||
        path.includes(`${join(this.packageRoot, ".typstbook")}`) ||
        path.includes("/.typstbook/"),
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
        rel === "typstbook.config.json" ||
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
        this.scheduleCompileAll(true);
        break;
      case "extract-file":
        await this.reloadFile(file);
        this.scheduleCompileAll(true);
        break;
      case "extract-all":
        await this.reloadAll();
        this.scheduleCompileAll(true);
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
      case "set-viewport":
        session.viewport = message.viewport;
        this.scheduleCompile(session);
        break;
      case "run-checks":
        void this.runChecks(session, message.storyId);
        break;
      case "accept-snapshot":
        void this.acceptSnapshot(session, message.storyId);
        break;
      case "open-editor":
        openInEditor(this.packageRoot, {
          file: message.file,
          line: message.line,
          column: message.column,
        });
        break;
      default: {
        const _exhaustive: never = message;
        return _exhaustive;
      }
    }
  }

  private async reloadAll(): Promise<void> {
    const previousFonts = this.config.fontPaths.join("\0");
    this.config = await loadTypstbookConfig(this.packageRoot);
    if (previousFonts !== this.config.fontPaths.join("\0")) {
      await this.resetPreviews();
    }
    const extracted = await extractAllStories({
      typst: this.typst,
      packageRoot: this.packageRoot,
      packagePath: this.packagePath,
    });
    this.stories = extracted.stories;
    this.errors = extracted.errors;
    this.tokens = await discoverPackageTokens(this.typst, this.packageRoot);
    this.fonts = await collectFontReport(
      this.typst,
      this.packageRoot,
      this.config,
      this.tokens,
    );
    this.syncAllSessions();
    this.broadcast({
      type: "stories",
      stories: this.stories,
      errors: this.errors,
      tokens: this.tokens,
      fonts: this.fonts,
    });
  }

  private async resetPreviews(): Promise<void> {
    for (const session of this.sessions.values()) {
      await session.preview?.stop();
      session.preview = null;
      session.watchStoryId = null;
    }
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
      tokens: this.tokens,
      fonts: this.fonts,
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

  private scheduleCompileAll(refresh = false): void {
    for (const session of this.sessions.values()) {
      this.scheduleCompile(session, refresh);
    }
  }

  private scheduleCompile(session: ClientSession, refresh = false): void {
    if (session.compileTimer) {
      clearTimeout(session.compileTimer);
    }
    session.compileRefresh = refresh;
    session.compileTimer = setTimeout(() => {
      session.compileTimer = null;
      const queuedRefresh = session.compileRefresh;
      session.compileRefresh = false;
      void this.compileSelected(session, queuedRefresh);
    }, COMPILE_DEBOUNCE_MS);
  }

  private previewFor(session: ClientSession): TypstPreviewWatch {
    if (!session.preview) {
      const preview = new TypstPreviewWatch({
        typst: this.typst,
        packageRoot: this.packageRoot,
        packagePath: this.packagePath,
        fontPaths: this.config.fontPaths,
      });
      preview.onUpdate = (result) => {
        this.publishPreview(session, result);
      };
      session.preview = preview;
    }
    return session.preview;
  }

  private publishPreview(
    session: ClientSession,
    result: { pages: string[]; diagnostics: string[] },
  ): void {
    const storyId = session.watchStoryId;
    if (!storyId) {
      return;
    }
    const problems = parseDiagnostics(result.diagnostics, {
      storyId,
      packageRoot: this.packageRoot,
    });
    void this.refreshFontsFromProblems(problems);
    if (result.pages.length === 0) {
      this.send(session.socket, {
        type: "preview-error",
        storyId,
        diagnostics: result.diagnostics,
        problems,
        lastGoodPages: session.lastGoodPages.get(storyId) ?? [],
      });
      return;
    }
    session.lastGoodPages.set(storyId, result.pages);
    this.send(session.socket, {
      type: "preview",
      storyId,
      pages: result.pages,
      diagnostics: result.diagnostics,
      problems,
    });
  }

  private async refreshFontsFromProblems(
    problems: ReturnType<typeof parseDiagnostics>,
  ): Promise<void> {
    if (!problems.some((item) => /unknown font family/i.test(item.message))) {
      return;
    }
    this.fonts = await collectFontReport(
      this.typst,
      this.packageRoot,
      this.config,
      this.tokens,
      problems.map((item) => item.raw),
    );
    this.broadcast({ type: "fonts", fonts: this.fonts });
  }

  private async compileSelected(session: ClientSession, refresh = false): Promise<void> {
    if (!session.selectedId) {
      return;
    }
    if (session.compiling) {
      session.compileQueued = true;
      session.compileRefresh = session.compileRefresh || refresh;
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
          problems: [
            {
              severity: "error",
              message: `Unknown story: ${storyId}`,
              file: null,
              line: null,
              column: null,
              storyId,
              raw: `Unknown story: ${storyId}`,
            },
          ],
          lastGoodPages: session.lastGoodPages.get(storyId) ?? [],
        });
        return;
      }
      const args = mergeStoryArgs(story.args, session.argsById.get(storyId));
      session.argsById.set(storyId, args);
      session.watchStoryId = storyId;
      const source = watchWrapperSource(
        toPosix(story.file),
        story.title,
        args,
        session.viewport,
        await hasPreviewFile(this.packageRoot),
      );
      const preview = this.previewFor(session);
      if (refresh && preview.matches(source)) {
        await preview.nudge();
      } else {
        await preview.push(source);
      }
    } finally {
      session.compiling = false;
      if (session.compileQueued) {
        const queuedRefresh = session.compileRefresh;
        session.compileQueued = false;
        session.compileRefresh = false;
        void this.compileSelected(session, queuedRefresh);
      }
    }
  }

  private async runChecks(session: ClientSession, storyId: string | null): Promise<void> {
    const options = {
      typst: this.typst,
      packageRoot: this.packageRoot,
      packagePath: this.packagePath,
      fontPaths: this.config.fontPaths,
    };
    if (storyId && !this.stories.some((story) => story.id === storyId)) {
      this.send(session.socket, {
        type: "check-results",
        results: [
          {
            storyId,
            file: "",
            title: storyId,
            status: "fail",
            assertions: [
              { name: "Story", status: "fail", detail: `Unknown story: ${storyId}` },
            ],
            diagnostics: [],
            snapshot: null,
          },
        ],
      });
      return;
    }
    const stories = storyId
      ? this.stories.filter((story) => story.id === storyId)
      : this.stories;
    const results = await runPackageChecks(options, stories);
    this.send(session.socket, { type: "check-results", results });
  }

  private async acceptSnapshot(session: ClientSession, storyId: string): Promise<void> {
    const story = this.stories.find((item) => item.id === storyId);
    if (!story) {
      this.send(session.socket, {
        type: "snapshot-accepted",
        storyId,
        ok: false,
        detail: `Unknown story: ${storyId}`,
      });
      return;
    }
    const options = {
      typst: this.typst,
      packageRoot: this.packageRoot,
      packagePath: this.packagePath,
      fontPaths: this.config.fontPaths,
    };
    try {
      const result = await acceptStorySnapshot(options, story);
      this.send(session.socket, {
        type: "snapshot-accepted",
        storyId,
        ok: result.status === "pass",
        detail:
          result.status === "pass"
            ? `Accepted baseline for ${story.title}.`
            : result.assertions.map((item) => item.detail).join("\n"),
        result,
      });
      this.send(session.socket, { type: "check-results", results: [result] });
    } catch (error) {
      this.send(session.socket, {
        type: "snapshot-accepted",
        storyId,
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      });
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
