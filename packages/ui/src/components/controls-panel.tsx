import { Box, Divider, HStack, Text, VStack } from "@seed-design/react";
import type { ReactNode } from "react";
import type { ControlsPlacement } from "@/lib/controls-placement";
import type { ArgType, StoryIR } from "@/lib/types";
import { Checkbox } from "seed-design/ui/checkbox";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectRoot,
  SelectTrigger,
} from "seed-design/ui/select";
import { TextField, TextFieldInput, TextFieldTextarea } from "seed-design/ui/text-field";

type ControlsPanelProps = {
  selected: StoryIR | undefined;
  args: Record<string, unknown>;
  placement: ControlsPlacement;
  onChange: (name: string, value: unknown) => void;
};

function ArgControl({
  name,
  argType,
  value,
  onChange,
}: {
  name: string;
  argType: ArgType;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
}) {
  const control = argType.control;
  switch (control) {
    case "boolean":
      return (
        <Checkbox
          label={name}
          tone="neutral"
          size="medium"
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(name, checked === true)}
        />
      );
    case "number":
      return (
        <TextField
          label={name}
          size="medium"
          value={String(value ?? 0)}
          onValueChange={({ value: next }) => onChange(name, Number(next))}
        >
          <TextFieldInput inputMode="decimal" />
        </TextField>
      );
    case "select":
      return (
        <SelectRoot
          label={name}
          size="medium"
          value={value == null || value === "" ? [] : [String(value)]}
          onValueChange={(next) => onChange(name, next[0] ?? "")}
        >
          <SelectTrigger placeholder="Select…" />
          <SelectContent>
            <SelectGroup>
              {(argType.options ?? []).map((option) => (
                <SelectItem
                  key={String(option)}
                  value={String(option)}
                  label={String(option)}
                />
              ))}
            </SelectGroup>
          </SelectContent>
        </SelectRoot>
      );
    case "color": {
      const hex = typeof value === "string" ? value : "#000000";
      return (
        <HStack gap="x2" align="flex-end" width="full">
          <Box
            width="x10"
            height="x10"
            borderRadius="r2"
            borderWidth={1}
            borderColor="stroke.neutralMuted"
            overflowX="hidden"
            overflowY="hidden"
            flexShrink={0}
          >
            <input
              type="color"
              aria-label={`${name} color`}
              value={hex}
              onChange={(event) => onChange(name, event.target.value)}
              style={{
                width: "100%",
                height: "100%",
                border: 0,
                padding: 0,
                cursor: "pointer",
                background: "transparent",
              }}
            />
          </Box>
          <Box flexGrow minWidth="0">
            <TextField
              label={name}
              size="medium"
              value={hex}
              onValueChange={({ value: next }) => onChange(name, next)}
            >
              <TextFieldInput />
            </TextField>
          </Box>
        </HStack>
      );
    }
    case "text":
      if (value && typeof value === "object") {
        return (
          <TextField label={name} size="medium">
            <TextFieldTextarea
              defaultValue={JSON.stringify(value, null, 2)}
              onBlur={(event) => {
                try {
                  onChange(name, JSON.parse(event.target.value));
                } catch {
                  onChange(name, event.target.value);
                }
              }}
              style={{ minHeight: 120 }}
            />
          </TextField>
        );
      }
      return (
        <TextField
          label={name}
          size="medium"
          value={String(value ?? "")}
          onValueChange={({ value: next }) => onChange(name, next)}
        >
          <TextFieldInput />
        </TextField>
      );
    default: {
      const _exhaustive: never = control;
      return _exhaustive;
    }
  }
}

export function ControlsPanel({
  selected,
  args,
  placement,
  onChange,
}: ControlsPanelProps) {
  const argEntries = selected ? Object.entries(selected.argTypes) : [];
  const borderProps = controlsBorder(placement);

  return (
    <VStack
      height="full"
      bg="bg.layerDefault"
      borderColor="stroke.neutralSubtle"
      {...borderProps}
    >
      <HStack align="center" justify="space-between" px="x4" py="x3">
        <Text textStyle="t4Bold" color="fg.neutralMuted">
          Controls
        </Text>
        <Text textStyle="t2Medium" color="fg.neutralSubtle">
          {argEntries.length}
        </Text>
      </HStack>
      <Divider />
      <Box flexGrow minHeight="0" overflowY="auto" px="x4" py="x3">
        {selected ? (
          argEntries.length > 0 ? (
            <ArgList placement={placement}>
              {argEntries.map(([name, argType]) => (
                <Box
                  key={name}
                  minWidth={placement === "bottom" ? "220px" : undefined}
                  style={
                    placement === "bottom"
                      ? { flexGrow: 1, flexBasis: 220, maxWidth: 360 }
                      : undefined
                  }
                >
                  <ArgControl
                    name={name}
                    argType={argType}
                    value={args[name]}
                    onChange={onChange}
                  />
                </Box>
              ))}
            </ArgList>
          ) : (
            <Box py="x8" px="x1">
              <Text
                as="p"
                textStyle="t4Regular"
                color="fg.neutralMuted"
                align="center"
              >
                This story has no args.
              </Text>
            </Box>
          )
        ) : null}
      </Box>
    </VStack>
  );
}

function controlsBorder(placement: ControlsPlacement) {
  switch (placement) {
    case "right":
      return { borderLeftWidth: 1 as const };
    case "bottom":
      return { borderTopWidth: 1 as const };
    default: {
      const _exhaustive: never = placement;
      return _exhaustive;
    }
  }
}

function ArgList({
  placement,
  children,
}: {
  placement: ControlsPlacement;
  children: ReactNode;
}) {
  switch (placement) {
    case "right":
      return <VStack gap="x4">{children}</VStack>;
    case "bottom":
      return (
        <HStack gap="x4" align="flex-start" style={{ flexWrap: "wrap" }}>
          {children}
        </HStack>
      );
    default: {
      const _exhaustive: never = placement;
      return _exhaustive;
    }
  }
}
