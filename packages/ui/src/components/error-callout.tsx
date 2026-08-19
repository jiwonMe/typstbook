import { IconExclamationmarkCircleFill } from "@karrotmarket/react-monochrome-icon";
import { Callout } from "seed-design/ui/callout";

type ErrorCalloutProps = {
  title?: string;
  description: string;
};

export function ErrorCallout({ title, description }: ErrorCalloutProps) {
  return (
    <Callout
      tone="critical"
      prefixIcon={<IconExclamationmarkCircleFill />}
      title={title}
      description={<span style={{ whiteSpace: "pre-wrap" }}>{description}</span>}
    />
  );
}
