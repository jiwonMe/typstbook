import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { groupStories, shortPath, type FileError, type StoryIR } from "@/lib/types";

type StorySidebarProps = {
  stories: StoryIR[];
  errors: FileError[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function StorySidebar({
  stories,
  errors,
  selectedId,
  onSelect,
}: StorySidebarProps) {
  const groups = groupStories(stories);
  const looseErrors = errors.filter(
    (error) => !stories.some((story) => story.file === error.file),
  );

  return (
    <aside className="flex h-full flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 px-3 py-3">
        <span
          aria-hidden
          className="size-[18px] rounded-[5px] bg-gradient-to-br from-[#7c86e8] via-primary to-[#4c57c3] shadow-[inset_0_1px_0_rgb(255_255_255/0.22)]"
        />
        <strong className="text-[13px] font-semibold tracking-tight">
          typstbook
        </strong>
        <Badge className="ml-auto">local</Badge>
      </div>
      <ScrollArea className="flex-1 px-2 pb-4">
        {[...groups.entries()].map(([file, fileStories]) => {
          const fileErrors = errors.filter((error) => error.file === file);
          return (
            <div key={file} className="mb-2.5">
              <div className="flex items-center gap-1.5 px-2 pb-1 pt-2 text-[11px] font-medium tracking-wide text-muted-foreground/80">
                <span className="size-1 rounded-full bg-muted-foreground/60" />
                <span className="truncate">{shortPath(file)}</span>
              </div>
              {fileStories.map((story) => {
                const active = story.id === selectedId;
                return (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => onSelect(story.id)}
                    className={cn(
                      "mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-[0.98]",
                      active && "bg-accent text-accent-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full bg-current opacity-35",
                        active && "bg-primary opacity-100 shadow-[0_0_0_3px_rgb(94_106_210/0.18)]",
                      )}
                    />
                    <span className="truncate">{story.title}</span>
                  </button>
                );
              })}
              {fileErrors.map((error) => (
                <pre
                  key={`${error.file}:${error.message}`}
                  className="mx-1 mt-1 whitespace-pre-wrap rounded-md border border-destructive/20 bg-destructive/10 p-2 font-mono text-[11px] leading-snug text-destructive"
                >
                  {error.message}
                </pre>
              ))}
            </div>
          );
        })}
        {looseErrors.map((error) => (
          <pre
            key={`${error.file}:${error.message}`}
            className="mx-1 mt-1 whitespace-pre-wrap rounded-md border border-destructive/20 bg-destructive/10 p-2 font-mono text-[11px] leading-snug text-destructive"
          >
            {error.file}: {error.message}
          </pre>
        ))}
      </ScrollArea>
    </aside>
  );
}
