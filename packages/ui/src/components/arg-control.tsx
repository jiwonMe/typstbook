import { useEffect, useRef, useState } from "react";
import { formatHex, formatHex8, parse } from "culori";
import {
  ColorField,
  PropertyRow,
  SelectField,
  SliderField,
  SwitchField,
  TextField,
} from "@/components/ui/field";
import { cn } from "@/lib/cn";
import type { ArgType } from "@/lib/types";

type ArgControlProps = {
  name: string;
  argType: ArgType;
  value: unknown;
  readOnly: boolean;
  structured: boolean;
  onChange: (name: string, value: unknown) => void;
};

function DraftField({ name, value, kind, argType, onChange }: {
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
    } catch {
      setError(true);
    }
  };
  return (
    <PropertyRow label={name} stack={kind === "json"}>
      {kind === "json" ? (
        <textarea
          aria-label={name}
          value={draft}
          className={cn(
            /* JSON 입력 */
            "min-h-16 w-full rounded-[5px] bg-[var(--color-bg-secondary)] px-2 py-1 font-mono text-[11px] leading-4 text-[var(--color-text)] outline-none",
            "focus:outline focus:outline-1 focus:outline-[var(--color-border-selected)]",
          )}
          onChange={(event) => update(event.target.value)}
        />
      ) : (
        <TextField label={name} value={draft} align="right" onChange={update} />
      )}
      {error ? (
        <p role="status" className={cn(/* 검증 메시지 */ "mt-1 text-ui text-[var(--color-text-danger)]")}>
          {kind === "json" ? "Enter valid JSON. Preview keeps the last valid value." : "Enter a valid number within the allowed range."}
        </p>
      ) : null}
    </PropertyRow>
  );
}

export function ArgControl({ name, argType, value, readOnly, structured, onChange }: ArgControlProps) {
  const update = (next: unknown) => {
    if (!readOnly) onChange(name, next);
  };
  if (readOnly) {
    const text = typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
    return (
      <PropertyRow label={name}>
        <output aria-label={name} className={cn(/* 읽기 전용 값 */ "block truncate text-right text-ui text-[var(--color-text)]")}>{text}</output>
      </PropertyRow>
    );
  }
  switch (argType.control) {
    case "boolean":
      return (
        <PropertyRow label={name}>
          <SwitchField label={name} checked={Boolean(value)} onChange={update} />
        </PropertyRow>
      );
    case "number":
      return typeof argType.min === "number" && typeof argType.max === "number" && argType.max > argType.min
        ? (
          <PropertyRow label={name}>
            <SliderField
              label={name}
              value={typeof value === "number" ? value : argType.min}
              min={argType.min}
              max={argType.max}
              step={argType.step ?? 1}
              onChange={update}
            />
          </PropertyRow>
        )
        : <DraftField name={name} value={value} kind="number" argType={argType} onChange={onChange} />;
    case "select": {
      const options = argType.options ?? [];
      const index = options.findIndex((option) => JSON.stringify(option) === JSON.stringify(value));
      return (
        <PropertyRow label={name}>
          <SelectField
            label={name}
            value={index < 0 ? "" : String(index)}
            options={options.map((option, i) => ({
              value: String(i),
              label: typeof option === "object" ? JSON.stringify(option) : String(option),
              payload: option,
            }))}
            onChange={update}
          />
        </PropertyRow>
      );
    }
    case "color":
      return (
        <PropertyRow label={name}>
          <ColorField
            label={name}
            value={typeof value === "string" ? value : "#000000"}
            onChange={(css) => {
              const color = parse(css);
              if (!color) return;
              update(color.alpha === undefined || color.alpha === 1 ? formatHex(color) : formatHex8(color));
            }}
          />
        </PropertyRow>
      );
    case "text":
      return structured || (value !== null && typeof value === "object")
        ? <DraftField name={name} value={value} kind="json" argType={argType} onChange={onChange} />
        : (
          <PropertyRow label={name}>
            <TextField label={name} value={String(value ?? "")} onChange={update} />
          </PropertyRow>
        );
  }
}
