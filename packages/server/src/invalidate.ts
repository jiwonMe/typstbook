import type { InvalidateAction, InvalidateReason } from "./types.ts";

export function invalidateFor(reason: InvalidateReason): InvalidateAction {
  switch (reason) {
    case "args":
      return "compile";
    case "story-file":
      return "extract-file";
    case "source":
      return "extract-all";
    case "config":
      return "extract-all";
    default: {
      const _exhaustive: never = reason;
      return _exhaustive;
    }
  }
}
