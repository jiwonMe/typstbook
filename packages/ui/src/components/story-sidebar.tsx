import { FileContentOutline18 } from "@/components/icons/FileContentOutline18";
import { Badge, Box, HStack, Icon, Text } from "@seed-design/react";
import { XmarkOutline18 } from "@/components/icons/XmarkOutline18";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { MagnifierOutline18 } from "@/components/icons/MagnifierOutline18";
import { useState } from "react";
import { useSideNavigationContext } from "@seed-design/react/primitive";
import { ErrorCallout } from "@/components/error-callout";
import { ThemeSetting } from "@/components/theme-setting";
import { groupStories, shortPath, type FileError, type StoryIR } from "@/lib/types";
import {
  SideNavigationContent,
  SideNavigationFooter,
  SideNavigationGroup,
  SideNavigationHeader,
  SideNavigationRoot,
  SideNavigationTrigger,
} from "seed-design/ui/side-navigation";

type StorySidebarProps = {
  stories: StoryIR[];
  errors: FileError[];
  selectedId: string | null;
  badgeLabel?: string;
  connected: boolean;
  overlay?: boolean;
  onClose?: () => void;
  onSelect: (id: string) => void;
};

function SidebarBrand({ badgeLabel = "local" }: { badgeLabel?: string }) {
  const { collapsed } = useSideNavigationContext();

  return (
    <HStack className="typstbook-sidebar__brand" align="center" gap="x1_5" style={{ paddingRight: collapsed ? 0 : 36 }}>
      <Box
        width="x5"
        height="x5"
        flexShrink={0}
        overflowX="hidden"
        overflowY="hidden"
        aria-hidden
      >
        <img
          src={`${import.meta.env.BASE_URL}typstbook-logo.svg`}
          alt=""
          width={20}
          height={20}
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      </Box>
      {!collapsed && (
        <>
          <Text textStyle="t4Bold" color="fg.neutral">
            typstbook
          </Text>
          <Badge size="medium" tone="neutral" variant="outline">
            {badgeLabel}
          </Badge>
        </>
      )}
    </HStack>
  );
}

export function StorySidebar({
  stories,
  errors,
  selectedId,
  badgeLabel,
  connected,
  overlay = false,
  onClose,
  onSelect,
}: StorySidebarProps) {
  const { collapsed } = useSideNavigationContext();
  const [query, setQuery] = useState("");
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const filtered = stories.filter((story) => {
    const text = `${story.title} ${story.file} ${story.description ?? ""}`.toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
  const groups = groupStories(stories);
  const visibleGroups = groupStories(filtered);
  const looseErrors = errors.filter(
    (error) => !stories.some((story) => story.file === error.file),
  );

  return (
    <SideNavigationRoot
      id="typstbook-stories"
      tone="neutral"
      className="typstbook-sidebar"
      role={overlay ? "dialog" : "navigation"}
      aria-label="Stories"
      aria-modal={overlay || undefined}
    >
      <SideNavigationHeader>
        <SidebarBrand badgeLabel={badgeLabel} />
      </SideNavigationHeader>
      {overlay ? (
        <ActionButton
          className="typstbook-sidebar__close"
          variant="ghost"
          size="xsmall"
          layout="iconOnly"
          aria-label="Close stories"
          onClick={onClose}
        >
          <Icon svg={<XmarkOutline18 />} />
        </ActionButton>
      ) : <SideNavigationTrigger aria-controls="typstbook-stories" aria-expanded={!collapsed} />}
      <Box className="typstbook-sidebar-search" px="x2" pt="x2" pb="x1">
        <TextField size="medium" value={query} prefixIcon={<MagnifierOutline18 />}
          onValueChange={({ value }) => setQuery(value)}>
          <TextFieldInput type="search" aria-label="Search stories" placeholder="Search stories…"
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.stopPropagation();
                setQuery("");
              }
            }} />
        </TextField>
      </Box>
      <HStack justify="space-between" align="center" px="x3" py="x1">
        <Text textStyle="t2Bold" color="fg.neutralMuted">Stories</Text>
        <Text textStyle="t2Regular" color="fg.neutralSubtle" aria-live="polite">
          {terms.length ? `${filtered.length} / ${stories.length}` : stories.length}
        </Text>
      </HStack>
      <SideNavigationContent>
        {stories.length === 0 && errors.length === 0 ? (
          <Text textStyle="t2Regular" color="fg.neutralMuted" style={{ padding: 8 }}>
            No stories found.
          </Text>
        ) : (
          filtered.length === 0 ? (
            <Box px="x3" py="x6">
              <Text as="p" textStyle="t3Medium" color="fg.neutral">No matching stories</Text>
              <Text as="p" textStyle="t2Regular" color="fg.neutralMuted">Try a story name or file path.</Text>
              <ActionButton variant="ghost" size="xsmall" onClick={() => setQuery("")}>Clear search</ActionButton>
            </Box>
          ) : <SideNavigationGroup
            forceOpen={terms.length > 0}
            items={[...visibleGroups.entries()].map(([file, fileStories]) => ({
              key: file,
              label: shortPath(file),
              prefixIcon: <FileContentOutline18 />,
              defaultOpen: true,
              items: fileStories.map((story) => ({
                key: story.id,
                label: story.title,
                current: story.id === selectedId,
                onClick: () => onSelect(story.id),
              })),
            }))}
          />
        )}
        {!collapsed &&
          [...groups.keys()].flatMap((file) =>
            errors
              .filter((error) => error.file === file)
              .map((error) => (
                <ErrorCallout
                  key={`${error.file}:${error.message}`}
                  description={error.message}
                />
              )),
          )}
        {!collapsed &&
          looseErrors.map((error) => (
            <ErrorCallout
              key={`${error.file}:${error.message}`}
              title={shortPath(error.file)}
              description={error.message}
            />
          ))}
      </SideNavigationContent>
      <SideNavigationFooter>
        <HStack justify="space-between" align="center" pb="x1">
          <Text textStyle="t2Regular" color="fg.neutralMuted">Workspace</Text>
          <Badge size="medium" variant="weak" tone={badgeLabel === "static" ? "neutral" : connected ? "positive" : "warning"}>
            {badgeLabel === "static" ? "Read only" : connected ? "Connected" : "Connecting"}
          </Badge>
        </HStack>
        <ThemeSetting />
      </SideNavigationFooter>
    </SideNavigationRoot>
  );
}
