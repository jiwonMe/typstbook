import chevronDown16 from "@/assets/icons/icon.16.chevron.down.svg?raw";
import chevronRight16 from "@/assets/icons/icon.16.chevron.right.svg?raw";
import component16 from "@/assets/icons/icon.16.component.svg?raw";
import frame16 from "@/assets/icons/icon.16.frame.svg?raw";
import chevronDown from "@/assets/icons/icon.24.chevron.down.svg?raw";
import devBrackets from "@/assets/icons/icon.24.dev-brackets.svg?raw";
import frame from "@/assets/icons/icon.24.frame.svg?raw";
import move from "@/assets/icons/icon.24.move.svg?raw";
import plusSmall from "@/assets/icons/icon.24.plus.small.svg?raw";
import rectangle from "@/assets/icons/icon.24.rectangle.small.svg?raw";
import sidebarOpen from "@/assets/icons/icon.24.sidebar.open.svg?raw";
import variableMode from "@/assets/icons/icon.24.variable.mode.small.svg?raw";
import { cn } from "@/lib/cn";

const EXTRA = {
  minus: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 11.25h14v1.5H5z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.25 5h1.5v5.25H18v1.5h-5.25V18h-1.5v-5.25H5v-1.5h5.25z"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.2 5.5 12 11.3l5.8-5.8 1 1L13 12.3l5.8 5.8-1 1L12 13.3l-5.8 5.8-1-1L11 12.3 5.2 6.5z"/></svg>`,
  print: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4h10v4H7zm-2 5h14a2 2 0 0 1 2 2v5h-4v4H7v-4H3v-5a2 2 0 0 1 2-2zm2 8h10v-3H7z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 5a5.5 5.5 0 0 1 4.4 8.8l3.9 3.9-1.1 1.1-3.9-3.9A5.5 5.5 0 1 1 10.5 5zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>`,
  "layout-right": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h10v14H4z" opacity=".35"/><path d="M16 5h4v14h-4z"/></svg>`,
  "layout-bottom": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v10H4z" opacity=".35"/><path d="M4 16h16v4H4z"/></svg>`,
} as const;

const ICONS = {
  "chevron-down-16": chevronDown16,
  "chevron-right-16": chevronRight16,
  "component-16": component16,
  "frame-16": frame16,
  "chevron-down": chevronDown,
  "dev-brackets": devBrackets,
  frame,
  move,
  "plus-small": plusSmall,
  rectangle,
  "sidebar-open": sidebarOpen,
  "variable-mode": variableMode,
  ...EXTRA,
} as const;

export type IconName = keyof typeof ICONS;

export function UiIcon({
  name,
  size = 24,
  className,
}: {
  name: IconName;
  size?: 16 | 24;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        /* 아이콘 박스. SVG가 칸을 가득 채운다 */
        "inline-flex shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full",
        size === 16 ? "size-4" : "size-6",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}
