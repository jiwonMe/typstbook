export type MarkupPreset = {
  id: string;
  label: string;
  value: string;
};

export const MARKUP_PRESETS: MarkupPreset[] = [
  { id: "short", label: "Short", value: "A short note." },
  {
    id: "long",
    label: "Long",
    value:
      "This is a longer body used to check wrapping, paragraph breaks, and how a component behaves when authors paste several sentences of real content into the slot.",
  },
  {
    id: "korean",
    label: "Korean",
    value: "한글 본문으로 줄바꿈과 맞춤법 길이를 확인합니다. 두 번째 문장도 함께 둡니다.",
  },
  { id: "math", label: "Math", value: "The identity $e^(i pi) + 1 = 0$ sits inline." },
  {
    id: "table",
    label: "Table",
    value: `#table(
  columns: 2,
  [Name], [Value],
  [alpha], [1],
  [beta], [2],
)`,
  },
];
