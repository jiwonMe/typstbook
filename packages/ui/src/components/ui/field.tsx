import type { ReactNode } from "react";
import { UiIcon } from "@/components/ui/icon";
import { Menu, MenuItem } from "@/components/ui/menu";
import { cn } from "@/lib/cn";

const inputClass = cn(
  /* 입력 크기 */
  "h-6 min-w-0 flex-1 rounded-[5px] bg-[var(--color-bg-secondary)] px-2 text-ui text-[var(--color-text)]",
  /* 포커스 */
  "outline-none focus:outline focus:outline-1 focus:outline-[var(--color-border-selected)]",
  "placeholder:text-[var(--color-text-tertiary)] disabled:text-[var(--color-text-disabled)]",
);

export function TextField({
  label,
  value,
  disabled,
  onChange,
  align,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  align?: "right";
}) {
  return (
    <input
      aria-label={label}
      disabled={disabled}
      value={value}
      className={cn(inputClass, align === "right" && "text-right tabular-nums")}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function SelectField<T>({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; payload: T }[];
  disabled?: boolean;
  onChange: (payload: T) => void;
}) {
  const current = options.find((option) => option.value === value);
  return (
    <Menu
      align="end"
      className={cn(/* 셀렉트는 행을 채운다 */ "flex w-full")}
      trigger={
        <button
          type="button"
          aria-label={label}
          disabled={disabled}
          className={cn(
            /* 드롭다운 */
            "flex h-6 w-full min-w-0 items-center rounded-[5px] border border-[var(--color-border)] bg-[var(--color-bg)] pl-2 text-ui text-[var(--color-text)]",
            "focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--color-border-selected)]",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          <span className={cn(/* 값 */ "min-w-0 flex-1 truncate text-left")}>{current?.label ?? "Value"}</span>
          <UiIcon name="chevron-down" />
        </button>
      }
    >
      {options.map((option) => (
        <MenuItem key={option.value} checked={option.value === value} onSelect={() => onChange(option.payload)}>
          {option.label}
        </MenuItem>
      ))}
    </Menu>
  );
}

export function ColorField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const hex = /^#([0-9a-f]{6})$/i.test(value) ? value : "#000000";
  return (
    <label className={cn(
      /* 색 입력 */
      "flex h-6 min-w-0 flex-1 items-center rounded-[5px] bg-[var(--color-bg-secondary)]",
      "focus-within:outline focus-within:outline-1 focus-within:outline-[var(--color-border-selected)]",
    )}>
      <span className={cn(/* 스와치 칸 */ "relative flex size-6 items-center justify-center")}>
        <span
          className={cn(/* 칩 */ "size-3.5 rounded-[2px] border border-[var(--color-bordertranslucent)]")}
          style={{ background: value || "#000000" }}
        />
        <input
          aria-label={`${label} swatch`}
          type="color"
          disabled={disabled}
          value={hex}
          className={cn(/* 네이티브 피커 */ "absolute inset-0 cursor-pointer opacity-0")}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
      <input
        aria-label={label}
        disabled={disabled}
        value={value}
        className={cn(
          /* 헥스 */
          "h-6 min-w-0 flex-1 bg-transparent pr-2 text-ui text-[var(--color-text)] outline-none",
        )}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function SwitchField({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        /* 스위치 트랙 */
        "relative h-6 w-10 shrink-0 rounded-[5px] disabled:opacity-40",
        checked ? "bg-[var(--color-bg-brand)]" : "bg-[var(--color-bg-secondary)]",
      )}
      onClick={() => onChange(!checked)}
    >
      <span className={cn(
        /* 노브 */
        "absolute top-px size-[22px] rounded-[4px] bg-[var(--color-bg)] shadow-[var(--shadow-elevation-100)]",
        checked ? "left-[17px]" : "left-px",
      )} />
    </button>
  );
}

export function SliderField({
  label,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className={cn(/* 슬라이더 행 */ "flex min-w-0 flex-1 items-center gap-2")}>
      <input
        aria-label={label}
        type="range"
        className={cn(/* 트랙 */ "tb-range min-w-0 flex-1")}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className={cn(/* 숫자 */ "w-10 shrink-0 text-right text-ui tabular-nums text-[var(--color-text)]")}>{value}</span>
    </div>
  );
}

export function PropertyRow({ label, children, stack }: { label: string; children: ReactNode; stack?: boolean }) {
  return (
    <div className={cn(
      /* 속성 행 */
      stack ? "grid gap-1 px-2 py-1 pl-4" : "flex min-h-8 items-center gap-2 py-1 pr-2 pl-4",
    )}>
      <span className={cn(
        /* 라벨 */
        "truncate text-ui text-[var(--color-text-secondary)]",
        stack ? "" : "w-16 shrink-0",
      )}>{label}</span>
      <div className={cn(/* 컨트롤 */ "min-w-0 flex-1")}>{children}</div>
    </div>
  );
}
