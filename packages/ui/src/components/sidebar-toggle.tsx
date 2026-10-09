import { IconButton } from "@/components/ui/button";
import { UiIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

type SidebarToggleProps = {
  compact: boolean;
  collapsed: boolean;
  overlayOpen: boolean;
  onExpand: () => void;
  onToggle: () => void;
};

export function SidebarToggle({ compact, collapsed, overlayOpen, onExpand, onToggle }: SidebarToggleProps) {
  const visible = compact || collapsed;
  if (!visible) return null;
  const expanded = compact ? overlayOpen : !collapsed;
  return (
    <div data-print-hide className={cn(/* 접힌 사이드바를 다시 연다 */ "absolute top-3 left-3 z-20")}>
      <IconButton
        data-sidebar-reopen
        size={32}
        label={expanded ? "Hide stories" : "Show stories"}
        pressed={overlayOpen}
        aria-expanded={expanded}
        aria-controls="typstbook-stories"
        onClick={compact ? onToggle : onExpand}
      >
        <UiIcon name="sidebar-open" />
      </IconButton>
    </div>
  );
}
