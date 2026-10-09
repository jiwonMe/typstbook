export function printPreview(title: string | undefined, pages: string[]) {
  const previous = document.title;
  if (title) document.title = title;
  const size = firstPageSizePt(pages);
  const style = size ? document.createElement("style") : null;
  if (style && size) {
    style.textContent = `@page { size: ${size.width}pt ${size.height}pt; margin: 0; }`;
    document.head.appendChild(style);
  }
  window.print();
  style?.remove();
  document.title = previous;
}

function firstPageSizePt(pages: string[]): { width: number; height: number } | null {
  const svg = pages[0];
  if (!svg) return null;
  const width = Number(/width="([\d.]+)pt"/.exec(svg)?.[1]);
  const height = Number(/height="([\d.]+)pt"/.exec(svg)?.[1]);
  if (!width || !height) return null;
  return { width, height };
}
