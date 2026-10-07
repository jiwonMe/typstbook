// Nucleo UI · outline · 18px. Vendored from the local Nucleo React package.
import type { SVGProps } from "react";

export type AlertWarningOutline18Props = SVGProps<SVGSVGElement> & {
  strokeWidth?: number | string;
};

export function AlertWarningOutline18({
  strokeWidth = 1.5,
  ...props
}: AlertWarningOutline18Props) {
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
      <line x1="9" y1="2.75" x2="9" y2="10.75" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
      <path d="M9,16c.551,0,1-.449,1-1s-.449-1-1-1-1,.449-1,1,.449,1,1,1Z" fill="currentColor" data-color="color-2" data-stroke="none" />
    </svg>
  );
}
