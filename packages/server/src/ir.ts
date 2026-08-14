import type { ArgType, ControlType, FileError, StoryIR } from "./types.ts";

export function titleSlug(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[\\/?#&=]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "story";
}

export function toPosix(relativeFile: string): string {
  return relativeFile.split("\\").join("/");
}

export function storyId(relativeFile: string, title: string): string {
  const posix = toPosix(relativeFile);
  const base = posix.replace(/\.story\.typ$/i, "").replace(/\.typ$/i, "");
  return `${base}--${titleSlug(title)}`;
}

export function inferControl(value: unknown): ControlType {
  if (typeof value === "boolean") {
    return "boolean";
  }
  if (typeof value === "number") {
    return "number";
  }
  if (
    typeof value === "string" &&
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)
  ) {
    return "color";
  }
  return "text";
}

export function inferArgTypes(
  args: Record<string, unknown>,
  explicit: Record<string, ArgType> = {},
): Record<string, ArgType> {
  const result: Record<string, ArgType> = {};
  const keys = new Set([...Object.keys(args), ...Object.keys(explicit)]);
  for (const key of keys) {
    const given = explicit[key];
    if (given) {
      result[key] = given;
      continue;
    }
    result[key] = { control: inferControl(args[key]) };
  }
  return result;
}

export function uniquifyStoryIds(stories: StoryIR[]): {
  stories: StoryIR[];
  errors: FileError[];
} {
  const seen = new Map<string, number>();
  const errors: FileError[] = [];
  const result = stories.map((story) => {
    const count = seen.get(story.id) ?? 0;
    seen.set(story.id, count + 1);
    if (count === 0) {
      return story;
    }
    errors.push({
      file: story.file,
      message: `Duplicate story id "${story.id}" (title "${story.title}")`,
    });
    return { ...story, id: `${story.id}--${count + 1}` };
  });
  return { stories: result, errors };
}
