import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { WebSocket } from "ws";
import { Workbench } from "./session.ts";
import { findTypstBinary } from "./typst.ts";
import type { ServerMessage } from "./types.ts";

const demoRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "examples",
  "demo-pkg",
);

function wsUrl(httpUrl: string): string {
  return `${httpUrl.replace(/^http/, "ws")}/__typstbook_ws`;
}

function collectMessages(socket: WebSocket): ServerMessage[] {
  const log: ServerMessage[] = [];
  socket.on("message", (data: Buffer) => {
    log.push(JSON.parse(data.toString()) as ServerMessage);
  });
  return log;
}

async function waitFor(
  log: ServerMessage[],
  predicate: (message: ServerMessage) => boolean,
  timeoutMs = 15000,
): Promise<ServerMessage> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const found = log.find(predicate);
    if (found) {
      return found;
    }
    await new Promise((r) => setTimeout(r, 20));
  }
  throw new Error("timed out waiting for a matching message");
}

describe("Workbench multi-client isolation", () => {
  it("keeps each client's selection, args, and compiled preview independent", async (t) => {
    if (!findTypstBinary()) {
      t.skip("typst is not on PATH");
      return;
    }
    const workbench = new Workbench({ packageRoot: demoRoot, port: 0 });
    const url = await workbench.start();

    const clientA = new WebSocket(wsUrl(url));
    const clientB = new WebSocket(wsUrl(url));
    const logA = collectMessages(clientA);
    const logB = collectMessages(clientB);

    try {
      await Promise.all([
        new Promise((r) => clientA.once("open", r)),
        new Promise((r) => clientB.once("open", r)),
      ]);
      await Promise.all([
        waitFor(logA, (m) => m.type === "stories"),
        waitFor(logB, (m) => m.type === "stories"),
      ]);

      // A and B pick different stories.
      clientA.send(
        JSON.stringify({ type: "select", storyId: "stories/callout--warning" }),
      );
      clientB.send(
        JSON.stringify({ type: "select", storyId: "stories/callout--info" }),
      );

      const previewA1 = await waitFor(
        logA,
        (m) => m.type === "preview" && m.storyId === "stories/callout--warning",
      );
      const previewB1 = await waitFor(
        logB,
        (m) => m.type === "preview" && m.storyId === "stories/callout--info",
      );
      assert.equal(previewA1.type, "preview");
      assert.equal(previewB1.type, "preview");

      // A switches its own variant to "error"; the compiled SVG's callout
      // border color should change accordingly (CJK glyphs are exported as
      // <use>-referenced paths, not literal text, so we check the color that
      // `variant` controls rather than the title string).
      clientA.send(
        JSON.stringify({
          type: "set-args",
          storyId: "stories/callout--warning",
          args: {
            title: "클라이언트 A 전용",
            variant: "error",
            body: "본문은 Controls에서 Typst 마크업으로 편집합니다.",
          },
        }),
      );
      const previewA2 = await waitFor(
        logA,
        (m) =>
          m.type === "preview" &&
          m.storyId === "stories/callout--warning" &&
          m.pages.join("\n").includes("#dc2626"),
      );
      assert.equal(previewA2.type, "preview");

      // Give the server a moment to (not) also push A's recompile to B.
      await new Promise((r) => setTimeout(r, 200));

      assert.equal(
        logB.some(
          (m) => m.type === "preview" && m.storyId === "stories/callout--warning",
        ),
        false,
        "client B must never receive client A's preview for a story B never selected",
      );

      // B's own story is untouched by A's edits.
      const infoPreviewsForB = logB.filter(
        (m) => m.type === "preview" && m.storyId === "stories/callout--info",
      );
      assert.ok(infoPreviewsForB.length >= 1);
    } finally {
      clientA.close();
      clientB.close();
      await workbench.stop();
    }
  });
});

describe("PDF export", () => {
  it("returns a downloadable PDF for a valid story", async (t) => {
    if (!findTypstBinary()) {
      t.skip("typst is not on PATH");
      return;
    }
    const workbench = new Workbench({ packageRoot: demoRoot, port: 0 });
    const url = await workbench.start();
    try {
      const response = await fetch(`${url}/__typstbook_pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: "stories/callout.stories.typ",
          title: "Warning",
          args: {
            title: "주의",
            variant: "warning",
            body: "본문은 Controls에서 Typst 마크업으로 편집합니다.",
          },
          page: { paper: "a6", margin: "12pt" },
        }),
      });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("content-type"), "application/pdf");
      assert.match(
        response.headers.get("content-disposition") ?? "",
        /attachment; filename="warning\.pdf"/,
      );
      const bytes = new Uint8Array(await response.arrayBuffer());
      assert.equal(Buffer.from(bytes.subarray(0, 5)).toString(), "%PDF-");
    } finally {
      await workbench.stop();
    }
  });

  it("responds with diagnostics instead of a PDF on a compile error", async (t) => {
    if (!findTypstBinary()) {
      t.skip("typst is not on PATH");
      return;
    }
    const workbench = new Workbench({ packageRoot: demoRoot, port: 0 });
    const url = await workbench.start();
    try {
      const response = await fetch(`${url}/__typstbook_pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: "stories/callout.stories.typ",
          title: "does-not-exist",
          args: {},
          page: null,
        }),
      });
      assert.equal(response.status, 422);
      const body = (await response.json()) as { diagnostics: string[] };
      assert.ok(body.diagnostics.length > 0);
    } finally {
      await workbench.stop();
    }
  });
});
