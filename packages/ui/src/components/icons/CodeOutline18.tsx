// Nucleo UI · outline · 18px. Vendored from the local Nucleo React package.
import type { SVGProps } from "react";

export type CodeOutline18Props = SVGProps<SVGSVGElement> & {
  strokeWidth?: number | string;
};

export function CodeOutline18({
  strokeWidth = 1.5,
  ...props
}: CodeOutline18Props) {
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
      <polyline points="6.5 13.75 1.75 9 6.5 4.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
      <polyline points="11.5 13.75 16.25 9 11.5 4.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} data-color="color-2" />
    </svg>
  );
}
