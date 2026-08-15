import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shortPath, type StoryIR } from "@/lib/types";
import { cn } from "@/lib/utils";

type PreviewCanvasProps = {
  selected: StoryIR | undefined;
  pages: string[];
  diagnostics: string[];
  previewError: boolean;
  zoom: number;
  pageIndex: number;
  storyCount: number;
  onZoom: (zoom: number) => void;
  onPageIndex: (index: number) => void;
};

export function PreviewCanvas({
  selected,
  pages,
  diagnostics,
  previewError,
  zoom,
  pageIndex,
  storyCount,
  onZoom,
  onPageIndex,
}: PreviewCanvasProps) {
  const pageSvg = pages[pageIndex];

  return (
    <main className="flex min-w-0 flex-col bg-[#0c0c0d]">
      <div className="flex min-h-11 items-center gap-2 border-b border-border bg-card px-3.5">
        <div className="mr-auto min-w-0">
          <div className="truncate text-[11px] text-muted-foreground/80">
            {selected ? shortPath(selected.file) : "No story selected"}
          </div>
          <div className="truncate text-[13px] font-medium tracking-tight">
            {selected?.title ?? "typstbook"}
          </div>
        </div>
        <div className="flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onZoom(zoom - 0.25)}
            aria-label="Zoom out"
          >
            <Minus />
          </Button>
          <span className="min-w-11 text-center font-mono text-xs tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onZoom(zoom + 0.25)}
            aria-label="Zoom in"
          >
            <Plus />
          </Button>
        </div>
        {pages.length > 1 ? (
          <div className="flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageIndex(Math.max(0, pageIndex - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft />
            </Button>
            <span className="min-w-11 text-center font-mono text-xs tabular-nums text-muted-foreground">
              {pageIndex + 1}/{pages.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                onPageIndex(Math.min(pages.length - 1, pageIndex + 1))
              }
              aria-label="Next page"
            >
              <ChevronRight />
            </Button>
          </div>
        ) : null}
      </div>

      <div
        className="flex flex-1 justify-center overflow-auto px-6 pb-10 pt-7"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.035) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      >
        <div className="flex w-max max-w-full flex-col items-center gap-3.5">
          {diagnostics.length > 0 ? (
            <pre className="w-[min(640px,100%)] whitespace-pre-wrap rounded-md border border-destructive/20 bg-destructive/10 px-3.5 py-3 font-mono text-[11px] leading-relaxed text-destructive">
              {diagnostics.join("\n\n")}
            </pre>
          ) : null}
          {pageSvg ? (
            <div
              className={cn(
                "overflow-hidden rounded-sm bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_18px_48px_rgb(0_0_0/0.45)] outline outline-1 outline-white/10 -outline-offset-1 transition-opacity",
                previewError && "opacity-40",
              )}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
              }}
              dangerouslySetInnerHTML={{ __html: pageSvg }}
            />
          ) : diagnostics.length === 0 ? (
            <div className="max-w-sm px-4 py-12 text-center text-sm leading-relaxed text-muted-foreground">
              {storyCount
                ? "Select a story to preview."
                : "No stories found. Add a *.story.typ file and wait for refresh."}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
