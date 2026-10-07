// Nucleo UI · outline · 18px. Vendored from the local Nucleo React package.
import type { SVGProps } from "react";

export type ChevronDownOutline18Props = SVGProps<SVGSVGElement> & {
  strokeWidth?: number | string;
};

export function ChevronDownOutline18({
  strokeWidth = 1.5,
  ...props
}: ChevronDownOutline18Props) {
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
      <polyline points="15.25 6.5 9 12.75 2.75 6.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
    </svg>
  );
}
