import { useState } from "react";
import { ErrorCallout } from "@/components/error-callout";
import { IconButton } from "@/components/ui/button";
import { UiIcon } from "@/components/ui/icon";
import { Menu, MenuItem } from "@/components/ui/menu";
import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";
import { groupStories, shortPath, type FileError, type StoryIR } from "@/lib/types";

type StorySidebarProps = {
  stories: StoryIR[];
  errors: FileError[];
  selectedId: string | null;
  badgeLabel?: string;
  connected: boolean;
  overlay?: boolean;
  onClose?: () => void;
  onToggleCollapsed?: () => void;
  onSelect: (id: string) => void;
};

export function StorySidebar({
  stories,
  errors,
  selectedId,
  badgeLabel = "local",
  connected,
  overlay = false,
  onClose,
  onToggleCollapsed,
  onSelect,
}: StorySidebarProps) {
  const [tab, setTab] = useState<"stories" | "assets">("stories");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [closed, setClosed] = useState<ReadonlySet<string>>(new Set());
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const filtered = stories.filter((story) => {
    const text = `${story.title} ${story.file} ${story.description ?? ""}`.toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
  const groups = groupStories(filtered);
  const status = badgeLabel === "static" ? "Read only" : connected ? "Connected" : "Connecting";

  return (
    <nav
      id="typstbook-stories"
      aria-label="Stories"
      role={overlay ? "dialog" : "navigation"}
      aria-modal={overlay || undefined}
      className={cn(
        /* 왼쪽 사이드바 */
        "flex h-full w-full min-w-0 flex-col bg-[var(--color-bg)] text-[var(--color-text)]",
      )}
    >
      <header className={cn(
        /* 파일 헤더 */
        "flex flex-col gap-1 border-b border-[var(--color-border)] px-2 pt-2 pb-3",
      )}>
        <div className={cn(/* 로고 줄 */ "flex h-8 items-center justify-between")}>
          <Menu
            trigger={
              <button
                type="button"
                className={cn(
                  /* 브랜드 버튼 */
                  "flex h-8 items-center gap-0.5 rounded-[5px] pr-1 hover:bg-[var(--color-bg-hover)]",
                )}
                aria-label="Workspace"
              >
                <span className={cn(/* 로고 패딩 */ "flex size-8 items-center justify-center")}>
                  <img src={`${import.meta.env.BASE_URL}typstbook-logo.svg`} alt="" width={24} height={24} />
                </span>
                <UiIcon name="chevron-down-16" className={cn(/* 보조 아이콘 */ "text-[var(--color-icon-secondary)]")} />
              </button>
            }
          >
            <MenuItem>{badgeLabel}</MenuItem>
            <MenuItem>{status}</MenuItem>
          </Menu>
          {overlay ? (
            <IconButton label="Close stories" onClick={onClose}><UiIcon name="x" /></IconButton>
          ) : (
            <IconButton size={32} label="Hide stories" data-sidebar-collapse aria-controls="typstbook-stories" aria-expanded onClick={onToggleCollapsed}>
              <UiIcon name="sidebar-open" />
            </IconButton>
          )}
        </div>
        <div className={cn(/* 제목 */ "flex h-6 items-center gap-1 px-2")}>
          <h1 className={cn(/* 파일 이름 */ "truncate text-title font-[550] text-[var(--color-text)]")}>typstbook</h1>
        </div>
        <p className={cn(/* 부제 */ "truncate px-2 text-ui text-[var(--color-text-secondary)]")}>{badgeLabel}</p>
      </header>

      <div className={cn(
        /* 탭 줄 */
        "flex h-10 items-center border-b border-[var(--color-border)] pr-2 pl-2",
      )}>
        <Tabs
          label="Sidebar"
          value={tab}
          onChange={setTab}
          tabs={[{ id: "stories", label: "Stories" }, { id: "assets", label: "Assets" }]}
        />
        <IconButton
          className={cn(/* 오른쪽 끝 */ "ml-auto")}
          label="Search stories"
          tone="selected"
          pressed={searching}
          onClick={() => setSearching((value) => !value)}
        >
          <UiIcon name="search" />
        </IconButton>
      </div>

      {searching ? (
        <div className={cn(/* 검색 */ "px-2 py-1")}>
          <input
            autoFocus
            type="search"
            aria-label="Search stories"
            placeholder="Search stories"
            value={query}
            className={cn(
              /* 검색 입력 */
              "h-6 w-full rounded-[5px] bg-[var(--color-bg-secondary)] px-2 text-ui text-[var(--color-text)] outline-none",
              "placeholder:text-[var(--color-text-tertiary)] focus:outline focus:outline-1 focus:outline-[var(--color-border-selected)]",
            )}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.stopPropagation();
                setQuery("");
              }
            }}
          />
        </div>
      ) : null}

      <div className={cn(/* 트리 */ "min-h-0 flex-1 overflow-auto pb-2")}>
        <SectionHeader label={tab === "stories" ? "Components" : "Files"} count={terms.length ? `${filtered.length} / ${stories.length}` : String(tab === "stories" ? stories.length : groups.size)} />
        {stories.length === 0 && errors.length === 0 ? (
          <p className={cn(/* 빈 상태 */ "px-4 py-2 text-ui text-[var(--color-text-secondary)]")}>No stories found.</p>
        ) : filtered.length === 0 ? (
          <div className={cn(/* 검색 없음 */ "px-4 py-4")}>
            <p className={cn(/* 제목 */ "text-ui font-[550]")}>No matching stories</p>
            <button type="button" className={cn(/* 지우기 */ "text-ui text-[var(--color-text-brand)]")} onClick={() => setQuery("")}>Clear search</button>
          </div>
        ) : tab === "assets" ? (
          [...groups.keys()].map((file) => (
            <TreeRow
              key={file}
              label={shortPath(file)}
              icon="frame-16"
              selected={groups.get(file)?.some((story) => story.id === selectedId) ?? false}
              onClick={() => {
                const first = groups.get(file)?.[0];
                if (first) onSelect(first.id);
              }}
            />
          ))
        ) : (
          [...groups.entries()].map(([file, fileStories]) => {
            const expanded = terms.length > 0 || !closed.has(file);
            return (
              <div key={file}>
                <TreeRow
                  label={shortPath(file)}
                  icon="component-16"
                  component
                  expanded={expanded}
                  selected={false}
                  onClick={() => {
                    setClosed((current) => {
                      const next = new Set(current);
                      if (next.has(file)) next.delete(file);
                      else next.add(file);
                      return next;
                    });
                  }}
                />
                {expanded ? fileStories.map((story) => (
                  <TreeRow
                    key={story.id}
                    label={story.title}
                    icon="frame-16"
                    depth={1}
                    selected={story.id === selectedId}
                    onClick={() => onSelect(story.id)}
                  />
                )) : null}
              </div>
            );
          })
        )}
        <div className={cn(/* 오류 */ "grid gap-1 px-2 pt-2")}>
          {errors.map((error) => (
            <ErrorCallout key={`${error.file}:${error.message}`} title={shortPath(error.file)} description={error.message} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function SectionHeader({ label, count }: { label: string; count: string }) {
  return (
    <div className={cn(
      /* 섹션 헤더 */
      "flex h-10 items-center gap-1 border-t border-[var(--color-border)] pr-2",
    )}>
      <span className={cn(/* 셰브론 슬롯 */ "flex w-4 justify-center")}>
        <UiIcon name="chevron-down-16" />
      </span>
      <span className={cn(/* 섹션 이름 */ "text-ui font-[550] text-[var(--color-text)]")}>{label}</span>
      <span aria-live="polite" className={cn(/* 개수 */ "ml-auto text-ui text-[var(--color-text-secondary)]")}>{count}</span>
    </div>
  );
}

function TreeRow({
  label,
  icon,
  depth = 0,
  selected,
  expanded,
  component,
  onClick,
}: {
  label: string;
  icon: "component-16" | "frame-16";
  depth?: number;
  selected: boolean;
  expanded?: boolean;
  component?: boolean;
  onClick: () => void;
}) {
  return (
    <div className={cn(/* 중첩 */ "pr-2")} style={{ paddingLeft: 16 + depth * 24 }}>
      <button
        type="button"
        aria-current={selected ? "true" : undefined}
        className={cn(
          /* 레이어 행 */
          "flex h-8 w-full items-center gap-2 rounded-[5px] px-1 text-left",
          selected ? "bg-[var(--color-bg-selected)]" : "hover:bg-[var(--color-bg-hover)]",
        )}
        onClick={onClick}
      >
        {expanded === undefined ? <span className={cn(/* 셰브론 자리 */ "size-4")} /> : (
          <UiIcon name="chevron-down-16" className={cn(expanded ? "" : "-rotate-90")} />
        )}
        <UiIcon
          name={icon}
          size={16}
          className={cn(component ? "text-[var(--color-icon-component)]" : "text-[var(--color-icon)]")}
        />
        <span className={cn(
          /* 이름 */
          "truncate text-ui",
          component ? "text-[var(--color-text-component)]" : "text-[var(--color-text)]",
        )}>{label}</span>
      </button>
    </div>
  );
}
