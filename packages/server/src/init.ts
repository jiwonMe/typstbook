import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ensureHelperPackagePath, HELPER_PACKAGE_SPEC } from "./typst.ts";

export type InitResult = {
  root: string;
  created: string[];
  skipped: string[];
};

const HELPER_IMPORT = HELPER_PACKAGE_SPEC;

export function packageNameFromDir(dirName: string): string {
  let name = dirName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (name === "") {
    return "my-package";
  }
  if (/^[0-9]/.test(name)) {
    name = `pkg-${name}`;
  }
  return name;
}

function typstToml(name: string): string {
  return `[package]
name = "${name}"
version = "0.1.0"
entrypoint = "src/lib.typ"
authors = ("${name}",)
license = "MIT"
description = "A Typst package"
`;
}

const LIB_TYP = `#let callout(title: "Note", variant: "info", body) = {
  let colors = (
    info: (border: rgb("#239DAD"), bg: rgb("#e7f6f8")),
    warning: (border: rgb("#d97706"), bg: rgb("#fff7ed")),
    error: (border: rgb("#dc2626"), bg: rgb("#fef2f2")),
  )
  let c = colors.at(variant)
  block(
    width: 100%,
    inset: 12pt,
    fill: c.bg,
    stroke: (left: 3pt + c.border),
    radius: 4pt,
  )[
    #strong(title)
    #parbreak()
    #body
  ]
}
`;

const PREVIEW_TYP = `// Shared setup for every story. Export \`preview\` and apply set/show inside it —
// bare top-level \`#set\` in this file does not affect story content.

#let preview(body) = {
  set text(size: 11pt)
  set par(justify: true)
  body
}
`;

const CALLOUT_STORY = `#import "${HELPER_IMPORT}": story
#import "/src/lib.typ": callout

#story(
  title: "Warning",
  args: (title: "주의", variant: "warning"),
  arg-types: (
    title: (control: "text"),
    variant: (control: "select", options: ("info", "warning", "error")),
  ),
  page: (paper: "a6", margin: 12pt),
  render: (args) => {
    callout(title: args.title, variant: args.variant)[Fixed body]
  },
)
`;

const HELLO_STORY = `#import "${HELPER_IMPORT}": story

#story(
  title: "Hello",
  args: (title: "Hello, typstbook"),
  page: (paper: "a6", margin: 16pt),
  render: (args) => [
    #set align(center)
    #text(size: 16pt, weight: "bold")[#args.title]
  ],
)
`;

async function writeIfMissing(
  root: string,
  relative: string,
  contents: string,
): Promise<"created" | "skipped"> {
  const dest = join(root, relative);
  if (existsSync(dest)) {
    return "skipped";
  }
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, contents, "utf8");
  return "created";
}

export async function initPackage(root: string): Promise<InitResult> {
  await mkdir(root, { recursive: true });

  const created: string[] = [];
  const skipped: string[] = [];
  const record = (relative: string, status: "created" | "skipped") => {
    if (status === "created") {
      created.push(relative);
    } else {
      skipped.push(relative);
    }
  };

  await ensureHelperPackagePath();

  const name = packageNameFromDir(root.split(/[\\/]/).filter(Boolean).at(-1) ?? "");
  record("typst.toml", await writeIfMissing(root, "typst.toml", typstToml(name)));
  record("src/lib.typ", await writeIfMissing(root, "src/lib.typ", LIB_TYP));
  record("preview.typ", await writeIfMissing(root, "preview.typ", PREVIEW_TYP));

  const storyPath = "stories/hello.stories.typ";
  const story = created.includes("src/lib.typ") ? CALLOUT_STORY : HELLO_STORY;
  record(storyPath, await writeIfMissing(root, storyPath, story));

  return { root, created, skipped };
}
