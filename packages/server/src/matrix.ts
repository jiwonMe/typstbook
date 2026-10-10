export type MatrixSpec = Record<string, unknown[]>;

export type MatrixCell = {
  /** Stable id within the story, such as `variant=info|size=s`. */
  id: string;
  args: Record<string, unknown>;
  label: string;
};

/** Parse `#story(matrix: (...))` dictionaries emitted through Story IR JSON. */
export function parseMatrix(value: unknown): MatrixSpec | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const out: MatrixSpec = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!Array.isArray(raw) || raw.length === 0) {
      continue;
    }
    out[key] = raw;
  }
  return Object.keys(out).length > 0 ? out : null;
}

/** Cartesian product of matrix axes, preserving key insertion order. */
export function expandMatrix(matrix: MatrixSpec | null): MatrixCell[] {
  if (!matrix) {
    return [];
  }
  const keys = Object.keys(matrix);
  let combos: Record<string, unknown>[] = [{}];
  for (const key of keys) {
    const values = matrix[key] ?? [];
    const next: Record<string, unknown>[] = [];
    for (const combo of combos) {
      for (const value of values) {
        next.push({ ...combo, [key]: value });
      }
    }
    combos = next;
  }
  return combos.map((args) => ({
    id: cellId(args),
    args,
    label: cellLabel(args),
  }));
}

export function cellId(args: Record<string, unknown>): string {
  return Object.entries(args)
    .map(([key, value]) => `${key}=${stringifyAxis(value)}`)
    .join("|");
}

export function cellLabel(args: Record<string, unknown>): string {
  return Object.entries(args)
    .map(([key, value]) => `${key}=${stringifyAxis(value)}`)
    .join(", ");
}

function stringifyAxis(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}
