// Nucleo UI · outline · 18px. Vendored from the local Nucleo React package.
import type { SVGProps } from "react";

export type DownloadOutline18Props = SVGProps<SVGSVGElement> & {
  strokeWidth?: number | string;
};

export function DownloadOutline18({
  strokeWidth = 1.5,
  ...props
}: DownloadOutline18Props) {
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
      <path d="M12 6.25H12.335C13.3 6.25 14.127 6.939 14.302 7.888L15.315 13.388C15.541 14.617 14.598 15.75 13.348 15.75H4.65199C3.40199 15.75 2.45899 14.617 2.68499 13.388L3.69799 7.888C3.87299 6.939 4.69999 6.25 5.66499 6.25H5.99999" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" /> <path d="M12 9.5L9 12.5L6 9.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" data-color="color-2" fill="none" /> <path d="M9 12.5V1.25" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" data-color="color-2" fill="none" />
    </svg>
  );
}
