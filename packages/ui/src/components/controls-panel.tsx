import { Badge, Box, HStack, Text, VStack } from "@seed-design/react";
import { ActionButton } from "seed-design/ui/action-button";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ColorControl, SelectControl, Slider, TextControl, Toggle } from "dialkit";
import { formatHex, formatHex8, parse } from "culori";
import type { ControlsPlacement } from "@/lib/controls-placement";
import type { ArgType, StoryIR } from "@/lib/types";

type ControlsPanelProps = {
  selected: StoryIR | undefined;
  args: Record<string, unknown>;
  placement: ControlsPlacement;
  readOnly?: boolean;
  onReset: () => void;
  onChange: (name: string, value: unknown) => void;
};

type ArgControlProps = {
  structured: boolean;
  name: string;
  argType: ArgType;
  value: unknown;
  readOnly: boolean;
  onChange: (name: string, value: unknown) => void;
};

// Keep incomplete numeric/JSON edits local. Reset and external updates replace
// the draft, while only valid values reach the compiler.
function DraftControl({ name, value, kind, argType, onChange }: {
  name: string;
  value: unknown;
  kind: "number" | "json";
  argType: ArgType;
  onChange: (name: string, value: unknown) => void;
}) {
  const serialized = kind === "json" ? JSON.stringify(value, null, 2) : String(value ?? 0);
  const [draft, setDraft] = useState(serialized);
  const [error, setError] = useState(false);
  const committed = useRef(serialized);
  useEffect(() => {
    if (serialized !== committed.current) {
      committed.current = serialized;
      setDraft(serialized);
      setError(false);
    }
  }, [serialized]);
  const update = (text: string) => {
    setDraft(text);
    try {
      const next: unknown = kind === "json" ? JSON.parse(text) : Number(text);
      if (kind === "number" && (text.trim() === "" || !Number.isFinite(next))) throw new Error();
      if (typeof next === "number" && (
        (argType.min !== undefined && next < argType.min) ||
        (argType.max !== undefined && next > argType.max)
      )) throw new Error();
      committed.current = kind === "json" ? JSON.stringify(next, null, 2) : String(next);
      setError(false);
      onChange(name, next);
    } catch { setError(true); }
  };
  return <div className="typstbook-draft-control" data-kind={kind}>
    <TextControl label={name} value={draft} onChange={update} />
    {error && <Text as="p" textStyle="t2Regular" color="fg.critical" role="status">
      {kind === "json" ? "Enter valid JSON. Preview keeps the last valid value." : "Enter a valid number within the allowed range."}
    </Text>}
  </div>;
}

function ArgControl({ name, argType, value, readOnly, structured, onChange }: ArgControlProps) {
  const update = (next: unknown) => { if (!readOnly) onChange(name, next); };
  if (readOnly) return <div className="typstbook-readonly-control">
    <Text textStyle="t3Medium" color="fg.neutralMuted">{name}</Text>
    <output aria-label={name}>{typeof value === "object" ? JSON.stringify(value) : String(value ?? "")}</output>
  </div>;
  switch (argType.control) {
    case "boolean":
      return <Toggle label={name} checked={Boolean(value)} onChange={update} />;
    case "number":
      return typeof argType.min === "number" && typeof argType.max === "number" && argType.max > argType.min
        ? <Slider label={name} value={typeof value === "number" ? value : argType.min}
            min={argType.min} max={argType.max} step={argType.step ?? 1} onChange={update} />
        : <DraftControl name={name} value={value} kind="number" argType={argType} onChange={onChange} />;
    case "select": {
      // Index keys preserve JSON option types, including numbers and booleans.
      const options = argType.options ?? [];
      const index = options.findIndex(option => JSON.stringify(option) === JSON.stringify(value));
      return <SelectControl label={name} value={index < 0 ? "" : String(index)}
        options={options.map((option, i) => ({ value: String(i), label: typeof option === "object" ? JSON.stringify(option) : String(option) }))}
        onChange={key => update(options[Number(key)])} />;
    }
    case "color":
      return <ColorControl label={name} value={typeof value === "string" ? value : "#000000"}
        onChange={css => {
          // DialKit offers CSS color spaces; Typst rgb() requires hex strings.
          const color = parse(css);
          if (color) update(color.alpha === undefined || color.alpha === 1 ? formatHex(color) : formatHex8(color));
        }} />;
    case "text":
      return structured || (value !== null && typeof value === "object")
        ? <DraftControl name={name} value={value} kind="json" argType={argType} onChange={onChange} />
        : <TextControl label={name} value={String(value ?? "")} onChange={update} />;
  }
}

export function ControlsPanel({
  selected,
  args,
  placement,
  readOnly = false,
  onReset,
  onChange,
}: ControlsPanelProps) {
  const [resetVersion, setResetVersion] = useState(0);
  const argEntries = selected ? Object.entries(selected.argTypes) : [];
  const changedCount = selected ? Object.keys(selected.args).filter(
    (name) => JSON.stringify(args[name]) !== JSON.stringify(selected.args[name]),
  ).length : 0;
  const borderProps = controlsBorder(placement);

  return (
    <VStack
      className="typstbook-controls dialkit-root"
      height="full"
      bg="bg.layerDefault"
      borderColor="stroke.neutralSubtle"
      {...borderProps}
    >
      <HStack className="typstbook-controls-header" align="center" justify="space-between" px="x3" py="x2"
        borderBottomWidth={1} borderColor="stroke.neutralSubtle">
        <HStack align="center" gap="x2">
          <Text textStyle="t3Bold" color="fg.neutral">Controls</Text>
          <Badge tone="neutral" variant="weak" size="medium">{argEntries.length}</Badge>
          {(readOnly || changedCount > 0) && <Text textStyle="t1Regular" color="fg.neutralSubtle" aria-live="polite">
            {readOnly ? "Read only" : `${changedCount} modified`}
          </Text>}
        </HStack>
        <ActionButton variant="ghost" size="xsmall" aria-label="Reset arguments"
          disabled={readOnly || argEntries.length === 0} onClick={() => { setResetVersion(version => version + 1); onReset(); }}>Reset</ActionButton>
      </HStack>
      <Box flexGrow minHeight="0" overflowY="auto" px="x3" py="x3">
        {selected ? (
          argEntries.length > 0 ? (
            <ArgList placement={placement}>
              {argEntries.map(([name, argType]) => (
                <Box
                  className="typstbook-control-field"
                  key={`${selected.id}:${name}:${argType.control}:${resetVersion}`}
                  minWidth={placement === "bottom" ? "200px" : undefined}
                  style={
                    placement === "bottom"
                      ? { flexGrow: 1, flexBasis: 200, maxWidth: 320 }
                      : undefined
                  }
                >
                  <ArgControl
                    name={name}
                    structured={selected.args[name] !== null && typeof selected.args[name] === "object"}
                    argType={argType}
                    value={args[name]}
                    readOnly={readOnly}
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
                No editable arguments
              </Text>
              <Text as="p" textStyle="t2Regular" color="fg.neutralSubtle" align="center">
                This story uses its source as written.
              </Text>
            </Box>
          )
        ) : <Text textStyle="t3Regular" color="fg.neutralMuted">Select a story to inspect its arguments.</Text>}
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
  return (
    <VStack
      gap="x1_5"
      style={{
        flexDirection: placement === "bottom" ? "row" : "column",
        flexWrap: placement === "bottom" ? "wrap" : "nowrap",
        alignItems: placement === "bottom" ? "flex-start" : "stretch",
      }}
    >
      {children}
    </VStack>
  );
}
