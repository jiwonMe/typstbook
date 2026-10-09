export type BackgroundId = "canvas" | "white" | "light" | "dark" | "checker" | "custom";

export const BACKGROUNDS: { id: BackgroundId; label: string }[] = [
  { id: "canvas", label: "Canvas" },
  { id: "white", label: "White" },
  { id: "light", label: "Light gray" },
  { id: "dark", label: "Dark" },
  { id: "checker", label: "Checkerboard" },
  { id: "custom", label: "Custom" },
];

export type CanvasBackground = {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
};

const CHECKER: CanvasBackground = {
  backgroundColor: "#ffffff",
  backgroundImage:
    "linear-gradient(45deg, #d4d4d4 25%, transparent 25%), linear-gradient(-45deg, #d4d4d4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d4d4d4 75%), linear-gradient(-45deg, transparent 75%, #d4d4d4 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
};

export function canvasBackground(id: BackgroundId, custom: string): CanvasBackground {
  switch (id) {
    case "canvas":
      return {};
    case "white":
      return { backgroundColor: "#ffffff" };
    case "light":
      return { backgroundColor: "#f5f5f5" };
    case "dark":
      return { backgroundColor: "#1e1e1e" };
    case "checker":
      return CHECKER;
    case "custom":
      return { backgroundColor: /^#[0-9a-fA-F]{6}$/.test(custom) ? custom : "#ffffff" };
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

export function readStoredBackground(): { id: BackgroundId; custom: string } {
  try {
    const raw = localStorage.getItem("typstbook-background");
    if (!raw) {
      return { id: "canvas", custom: "#ffffff" };
    }
    const parsed = JSON.parse(raw) as { id?: BackgroundId; custom?: string };
    const id = BACKGROUNDS.some((item) => item.id === parsed.id) ? parsed.id! : "canvas";
    const custom = typeof parsed.custom === "string" ? parsed.custom : "#ffffff";
    return { id, custom };
  } catch {
    return { id: "canvas", custom: "#ffffff" };
  }
}
