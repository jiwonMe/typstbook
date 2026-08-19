import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { mimeFor, resolveStaticFile } from "./static.ts";

describe("resolveStaticFile", () => {
  it("serves files, directory index, and SPA fallback", async () => {
    const root = await mkdtemp(join(tmpdir(), "typstbook-static-"));
    await writeFile(join(root, "index.html"), "<html></html>");
    await mkdir(join(root, "assets"));
    await writeFile(join(root, "assets", "app.js"), "console.log(1)");

    assert.equal(resolveStaticFile(root, "/"), join(root, "index.html"));
    assert.equal(
      resolveStaticFile(root, "/assets/app.js"),
      join(root, "assets", "app.js"),
    );
    assert.equal(resolveStaticFile(root, "/story/foo"), join(root, "index.html"));
    assert.equal(resolveStaticFile(root, "/assets/missing.js"), null);
  });

  it("rejects path traversal", async () => {
    const root = await mkdtemp(join(tmpdir(), "typstbook-static-"));
    await writeFile(join(root, "index.html"), "<html></html>");

    assert.equal(resolveStaticFile(root, "/../package.json"), null);
    assert.equal(resolveStaticFile(root, "/%2e%2e/package.json"), null);
  });
});

describe("mimeFor", () => {
  it("maps common UI assets", () => {
    assert.equal(mimeFor("index.html"), "text/html; charset=utf-8");
    assert.equal(mimeFor("app.js"), "text/javascript; charset=utf-8");
    assert.equal(mimeFor("app.css"), "text/css; charset=utf-8");
    assert.equal(mimeFor("unknown.bin"), "application/octet-stream");
  });
});
