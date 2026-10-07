// Nucleo UI · outline · 18px. Vendored from the local Nucleo React package.
import type { SVGProps } from "react";

export type ChevronRightOutline18Props = SVGProps<SVGSVGElement> & {
  strokeWidth?: number | string;
};

export function ChevronRightOutline18({
  strokeWidth = 1.5,
  ...props
}: ChevronRightOutline18Props) {
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
      <polyline points="6.5 2.75 12.75 9 6.5 15.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
    </svg>
  );
}
