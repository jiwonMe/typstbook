import { LaptopOutline18 } from "@/components/icons/LaptopOutline18";
import { MoonOutline18 } from "@/components/icons/MoonOutline18";
import { SunOutline18 } from "@/components/icons/SunOutline18";
import { HStack, Icon, Text } from "@seed-design/react";
import { useSideNavigationContext } from "@seed-design/react/primitive";
import { useColorMode } from "@/hooks/use-color-mode";
import { cycleColorMode, type ColorMode } from "@/lib/theme";
import { ActionButton } from "seed-design/ui/action-button";
import { SideNavigationItemButton } from "seed-design/ui/side-navigation";

const COLOR_MODES: ColorMode[] = ["light-only", "dark-only", "system"];

function colorModeLabel(mode: ColorMode): string {
  switch (mode) {
    case "light-only":
      return "Light";
    case "dark-only":
      return "Dark";
    case "system":
      return "System";
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

function colorModeIcon(mode: ColorMode) {
  switch (mode) {
    case "light-only":
      return <SunOutline18 />;
    case "dark-only":
      return <MoonOutline18 />;
    case "system":
      return <LaptopOutline18 />;
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

export function ThemeSetting() {
  const { colorMode, setColorMode } = useColorMode();
  const { collapsed } = useSideNavigationContext();

  if (collapsed) {
    return (
      <SideNavigationItemButton
        label={colorModeLabel(colorMode)}
        prefixIcon={colorModeIcon(colorMode)}
        onClick={() => setColorMode(cycleColorMode(colorMode))}
      />
    );
  }

  return (
    <HStack justify="space-between" align="center">
      <Text textStyle="t2Regular" color="fg.neutralMuted">Appearance</Text>
      <HStack
        align="center"
        gap="x1"
      >
        {COLOR_MODES.map((mode) => {
          const selected = colorMode === mode;
          return (
            <ActionButton
              key={mode}
              variant={selected ? "neutralWeak" : "ghost"}
              size="xsmall"
              layout="iconOnly"
              aria-label={colorModeLabel(mode)}
              title={colorModeLabel(mode)}
              aria-pressed={selected}
              onClick={() => setColorMode(mode)}
            >
              <Icon svg={colorModeIcon(mode)} />
            </ActionButton>
          );
        })}
      </HStack>
    </HStack>
  );
}
