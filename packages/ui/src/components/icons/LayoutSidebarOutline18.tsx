// Nucleo UI · outline · 18px. Vendored from the local Nucleo React package.
import type { SVGProps } from "react";

export type LayoutSidebarOutline18Props = SVGProps<SVGSVGElement> & {
  strokeWidth?: number | string;
};

export function LayoutSidebarOutline18({
  strokeWidth = 1.5,
  ...props
}: LayoutSidebarOutline18Props) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      {...props}
    >
      <path d="M4,2.75H14.25c1.105,0,2,.895,2,2V13.25c0,1.105-.895,2-2,2H4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
      <rect x="1.75" y="2.75" width={4.5} height={12.5} rx="2" ry="2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} data-color="color-2" />
    </svg>
  );
}
