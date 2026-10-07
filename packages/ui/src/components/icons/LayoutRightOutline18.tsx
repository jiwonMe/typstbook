// Nucleo UI · outline · 18px. Vendored from the local Nucleo React package.
import type { SVGProps } from "react";

export type LayoutRightOutline18Props = SVGProps<SVGSVGElement> & {
  strokeWidth?: number | string;
};

export function LayoutRightOutline18({
  strokeWidth = 1.5,
  ...props
}: LayoutRightOutline18Props) {
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
      <rect x="1.75" y="2.75" width={14.5} height={12.5} rx="2" ry="2" transform="translate(18 18) rotate(180)" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
      <line x1="13.25" y1="5.75" x2="13.25" y2="12.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} data-color="color-2" />
    </svg>
  );
}
