import { IconDocumentLine } from "@karrotmarket/react-monochrome-icon";
import { Badge, Box, HStack, Text } from "@seed-design/react";
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
  onSelect: (id: string) => void;
};

function SidebarBrand() {
  const { collapsed } = useSideNavigationContext();

  return (
    <HStack align="center" gap="x1_5" style={{ paddingRight: collapsed ? 0 : 36 }}>
      <Box
        width="x5"
        height="x5"
        flexShrink={0}
        overflowX="hidden"
        overflowY="hidden"
        aria-hidden
      >
        <img
          src="/typstbook-logo.svg"
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
          <Badge size="medium" tone="informative" variant="weak">
            local
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
  onSelect,
}: StorySidebarProps) {
  const { collapsed } = useSideNavigationContext();
  const groups = groupStories(stories);
  const looseErrors = errors.filter(
    (error) => !stories.some((story) => story.file === error.file),
  );

  return (
    <SideNavigationRoot tone="neutral" className="typstbook-sidebar">
      <SideNavigationHeader>
        <SidebarBrand />
      </SideNavigationHeader>
      <SideNavigationTrigger />
      <SideNavigationContent>
        {stories.length === 0 && errors.length === 0 ? (
          <Text textStyle="t2Regular" color="fg.neutralMuted" style={{ padding: 8 }}>
            No stories found.
          </Text>
        ) : (
          <SideNavigationGroup
            items={[...groups.entries()].map(([file, fileStories]) => ({
              key: file,
              label: shortPath(file),
              prefixIcon: <IconDocumentLine />,
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
        <ThemeSetting />
      </SideNavigationFooter>
    </SideNavigationRoot>
  );
}
