import { MenuOutline18 } from "@/components/icons/MenuOutline18";
import { Box, Icon } from "@seed-design/react";
import { useSideNavigationContext } from "@seed-design/react/primitive";
import { ActionButton } from "seed-design/ui/action-button";

type SidebarToggleProps = {
  compact: boolean;
  collapsed: boolean;
  overlayOpen: boolean;
  onToggle: () => void;
};

export function SidebarToggle({ compact, collapsed, overlayOpen, onToggle }: SidebarToggleProps) {
  const { setCollapsed } = useSideNavigationContext();
  const expanded = compact ? overlayOpen : !collapsed;
  return (
    <Box className="typstbook-sidebar-toggle" data-collapsed={collapsed} flexShrink={0}>
      <ActionButton
        variant={overlayOpen ? "neutralWeak" : "ghost"}
        size="xsmall"
        layout={compact ? "iconOnly" : undefined}
        aria-label={expanded ? "Hide stories" : "Show stories"}
        title={expanded ? "Hide stories" : "Show stories"}
        aria-expanded={expanded}
        aria-controls="typstbook-stories"
        onClick={compact ? onToggle : () => setCollapsed(false)}
      >
        <Icon svg={<MenuOutline18 />} />
        {!compact && "Stories"}
      </ActionButton>
    </Box>
  );
}
