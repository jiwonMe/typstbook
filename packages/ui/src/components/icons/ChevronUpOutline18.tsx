// Nucleo UI · outline · 18px. Vendored from the local Nucleo React package.
import type { SVGProps } from "react";

export type ChevronUpOutline18Props = SVGProps<SVGSVGElement> & {
  strokeWidth?: number | string;
};

export function ChevronUpOutline18({
  strokeWidth = 1.5,
  ...props
}: ChevronUpOutline18Props) {
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
      <polyline points="2.75 11.5 9 5.25 15.25 11.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
    </svg>
  );
}
