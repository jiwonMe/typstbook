import { AlertWarningOutline18 } from "@/components/icons/AlertWarningOutline18";
import { Callout } from "seed-design/ui/callout";

type ErrorCalloutProps = {
  title?: string;
  description: string;
};

export function ErrorCallout({ title, description }: ErrorCalloutProps) {
  return (
    <Callout
      tone="critical"
      prefixIcon={<AlertWarningOutline18 />}
      title={title}
      description={<span style={{ whiteSpace: "pre-wrap" }}>{description}</span>}
    />
  );
}
