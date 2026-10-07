import { CheckOutline18 } from "@/components/icons/CheckOutline18";
import { CopyOutline18 } from "@/components/icons/CopyOutline18";
import { Box, HStack, PrefixIcon, Text } from "@seed-design/react";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";

type CodePanelProps = {
  code: string;
};

export function CodePanel({ code }: CodePanelProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        // Clipboard access can be denied (permissions, insecure context); no-op.
      });
  };

  return (
    <Box
      data-print-hide
      position="relative"
      width="full"
      maxWidth="720px"
      mx="auto"
      mb="x4"
      borderRadius="r2"
      borderWidth={1}
      borderColor="stroke.neutralSubtle"
      bg="bg.layerDefault"
      overflowX="hidden"
      overflowY="hidden"
    >
      <HStack justify="space-between" align="center" px="x3" py="x1"
        borderBottomWidth={1} borderColor="stroke.neutralSubtle">
        <Text textStyle="t2Medium" color="fg.neutralMuted">Typst source</Text>
        <ActionButton variant="ghost" size="xsmall"
          aria-label={copied ? "Copied" : "Copy code"} onClick={copy}>
          <PrefixIcon svg={copied ? <CheckOutline18 /> : <CopyOutline18 />} />
          {copied ? "Copied" : "Copy"}
        </ActionButton>
      </HStack>
      <Box
        as="pre"
        px="x3"
        py="x2"
        style={{
          margin: 0,
          maxHeight: 280,
          overflow: "auto",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontSize: 12,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {code}
      </Box>
    </Box>
  );
}
