// Nucleo UI · outline · 18px. Vendored from the local Nucleo React package.
import type { SVGProps } from "react";

export type MenuOutline18Props = SVGProps<SVGSVGElement> & {
  strokeWidth?: number | string;
};

export function MenuOutline18({
  strokeWidth = 1.5,
  ...props
}: MenuOutline18Props) {
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
      <line x1="2.25" y1="9" x2="15.75" y2="9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} data-color="color-2" />
      <line x1="2.25" y1="3.75" x2="15.75" y2="3.75" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
      <line x1="2.25" y1="14.25" x2="15.75" y2="14.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
    </svg>
  );
}
