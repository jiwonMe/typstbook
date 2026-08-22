import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  diffSnapshot,
  readSnapshotPages,
  snapshotDirFor,
  writeSnapshotPages,
} from "./snapshot.ts";

describe("snapshotDirFor", () => {
  it("mirrors the story id under __snapshots__", () => {
    const dir = snapshotDirFor("/pkg", "stories/callout--warning");
    assert.equal(dir, join("/pkg", "__snapshots__", "stories", "callout--warning"));
  });
});

describe("readSnapshotPages / writeSnapshotPages", () => {
  it("returns null when no snapshot exists yet", async () => {
    const root = await mkdtemp(join(tmpdir(), "typstbook-snapshot-"));
    try {
      const pages = await readSnapshotPages(join(root, "missing"));
      assert.equal(pages, null);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("round-trips pages in order with zero-padded names", async () => {
    const root = await mkdtemp(join(tmpdir(), "typstbook-snapshot-"));
    try {
      const dir = join(root, "story");
      const pages = ["<svg>one</svg>", "<svg>two</svg>"];
      await writeSnapshotPages(dir, pages);
      const names = (await readdir(dir)).sort();
      assert.deepEqual(names, ["page-001.svg", "page-002.svg"]);
      const roundTripped = await readSnapshotPages(dir);
      assert.deepEqual(roundTripped, pages);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("overwrites stale pages when the new page count is smaller", async () => {
    const root = await mkdtemp(join(tmpdir(), "typstbook-snapshot-"));
    try {
      const dir = join(root, "story");
      await writeSnapshotPages(dir, ["<svg>one</svg>", "<svg>two</svg>"]);
      await writeSnapshotPages(dir, ["<svg>only</svg>"]);
      const roundTripped = await readSnapshotPages(dir);
      assert.deepEqual(roundTripped, ["<svg>only</svg>"]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("diffSnapshot", () => {
  it("reports new when there is no expected snapshot", () => {
    const diff = diffSnapshot(null, ["<svg/>"]);
    assert.equal(diff.status, "new");
    assert.deepEqual(diff.diffPages, []);
  });

  it("reports match for identical pages", () => {
    const diff = diffSnapshot(["<svg/>", "<svg2/>"], ["<svg/>", "<svg2/>"]);
    assert.equal(diff.status, "match");
    assert.deepEqual(diff.diffPages, []);
  });

  it("reports changed with 1-based differing page indices", () => {
    const diff = diffSnapshot(["<svg/>", "<svg2/>"], ["<svg/>", "<svg3/>"]);
    assert.equal(diff.status, "changed");
    assert.deepEqual(diff.diffPages, [2]);
  });

  it("treats a page-count change as changed, flagging the extra pages", () => {
    const diff = diffSnapshot(["<svg/>"], ["<svg/>", "<svg2/>"]);
    assert.equal(diff.status, "changed");
    assert.deepEqual(diff.diffPages, [2]);
  });
});
