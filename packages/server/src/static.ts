import { createReadStream, existsSync, statSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { extname, join, relative, resolve, sep } from "node:path";

const MIME_BY_EXT: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".map": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export function resolveStaticFile(root: string, pathname: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes("\0")) {
    return null;
  }

  const requested = resolve(root, `.${decoded}`);
  const rel = relative(root, requested);
  if (rel.startsWith("..") || rel.split(sep).includes("..")) {
    return null;
  }
  if (requested !== root && !requested.startsWith(root + sep)) {
    return null;
  }

  if (existsSync(requested)) {
    const stat = statSync(requested);
    if (stat.isFile()) {
      return requested;
    }
    if (stat.isDirectory()) {
      const index = join(requested, "index.html");
      return existsSync(index) ? index : null;
    }
  }

  const ext = extname(requested);
  if (ext && ext !== ".html") {
    return null;
  }
  const fallback = join(root, "index.html");
  return existsSync(fallback) ? fallback : null;
}

export function mimeFor(file: string): string {
  return MIME_BY_EXT[extname(file)] ?? "application/octet-stream";
}

export function serveStatic(
  root: string,
  req: IncomingMessage,
  res: ServerResponse,
): void {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const file = resolveStaticFile(root, url.pathname);
  if (!file) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const headers = { "Content-Type": mimeFor(file) };
  if (req.method === "HEAD") {
    res.writeHead(200, headers);
    res.end();
    return;
  }

  const stream = createReadStream(file);
  stream.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    }
    res.end();
  });
  res.writeHead(200, headers);
  stream.pipe(res);
}
