// Nucleo UI · outline · 18px. Vendored from the local Nucleo React package.
import type { SVGProps } from "react";

export type SunOutline18Props = SVGProps<SVGSVGElement> & {
  strokeWidth?: number | string;
};

export function SunOutline18({
  strokeWidth = 1.5,
  ...props
}: SunOutline18Props) {
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
      <line x1="9" y1="1.25" x2="9" y2="2.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} data-color="color-2" />
      <line x1="14.48" y1="3.52" x2="13.773" y2="4.227" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} data-color="color-2" />
      <line x1="16.75" y1="9" x2="15.75" y2="9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} data-color="color-2" />
      <line x1="14.48" y1="14.48" x2="13.773" y2="13.773" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} data-color="color-2" />
      <line x1="9" y1="16.75" x2="9" y2="15.75" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} data-color="color-2" />
      <line x1="3.52" y1="14.48" x2="4.227" y2="13.773" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} data-color="color-2" />
      <line x1="1.25" y1="9" x2="2.25" y2="9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} data-color="color-2" />
      <line x1="3.52" y1="3.52" x2="4.227" y2="4.227" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} data-color="color-2" />
      <circle cx="9" cy="9" r="4.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
    </svg>
  );
}
