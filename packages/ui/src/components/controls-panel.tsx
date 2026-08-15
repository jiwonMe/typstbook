import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { ArgType, StoryIR } from "@/lib/types";

type ControlsPanelProps = {
  selected: StoryIR | undefined;
  args: Record<string, unknown>;
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
        <div className="flex items-center gap-2">
          <Checkbox
            id={name}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(name, checked === true)}
          />
          <Label htmlFor={name}>{name}</Label>
        </div>
      );
    case "number":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={name}>{name}</Label>
          <Input
            id={name}
            type="number"
            value={String(value ?? 0)}
            onChange={(event) => onChange(name, Number(event.target.value))}
          />
        </div>
      );
    case "select":
      return (
        <div className="space-y-1.5">
          <Label>{name}</Label>
          <Select
            value={String(value ?? "")}
            onValueChange={(next) => onChange(name, next)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {(argType.options ?? []).map((option) => (
                <SelectItem key={String(option)} value={String(option)}>
                  {String(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case "color":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={name}>{name}</Label>
          <Input
            id={name}
            type="color"
            className="h-9 cursor-pointer p-1"
            value={typeof value === "string" ? value : "#5e6ad2"}
            onChange={(event) => onChange(name, event.target.value)}
          />
        </div>
      );
    case "text":
      if (value && typeof value === "object") {
        return (
          <div className="space-y-1.5">
            <Label htmlFor={name}>{name}</Label>
            <Textarea
              id={name}
              defaultValue={JSON.stringify(value, null, 2)}
              onBlur={(event) => {
                try {
                  onChange(name, JSON.parse(event.target.value));
                } catch {
                  onChange(name, event.target.value);
                }
              }}
            />
          </div>
        );
      }
      return (
        <div className="space-y-1.5">
          <Label htmlFor={name}>{name}</Label>
          <Input
            id={name}
            type="text"
            value={String(value ?? "")}
            onChange={(event) => onChange(name, event.target.value)}
          />
        </div>
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
  onChange,
}: ControlsPanelProps) {
  const argEntries = selected ? Object.entries(selected.argTypes) : [];

  return (
    <aside className="flex h-full flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between px-3.5 py-3">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Controls
        </h2>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {argEntries.length}
        </span>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3.5 py-3">
        {selected ? (
          argEntries.length > 0 ? (
            <div className="space-y-3.5">
              {argEntries.map(([name, argType]) => (
                <ArgControl
                  key={name}
                  name={name}
                  argType={argType}
                  value={args[name]}
                  onChange={onChange}
                />
              ))}
            </div>
          ) : (
            <p className="px-1 py-8 text-center text-sm text-muted-foreground">
              This story has no args.
            </p>
          )
        ) : null}
      </ScrollArea>
    </aside>
  );
}
