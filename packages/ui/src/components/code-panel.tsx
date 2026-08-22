import {
  IconCheckmarkClipboardFill,
  IconCheckmarkClipboardLine,
} from "@karrotmarket/react-monochrome-icon";
import { Box, Icon } from "@seed-design/react";
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
      borderRadius="r3"
      borderWidth={1}
      borderColor="stroke.neutralSubtle"
      bg="bg.layerDefault"
      overflowX="hidden"
      overflowY="hidden"
    >
      <Box
        as="pre"
        px="x4"
        py="x3"
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
      <Box position="absolute" top="8px" right="8px">
        <ActionButton
          variant="ghost"
          size="xsmall"
          layout="iconOnly"
          aria-label={copied ? "Copied" : "Copy code"}
          onClick={copy}
        >
          <Icon
            svg={
              copied ? <IconCheckmarkClipboardFill /> : <IconCheckmarkClipboardLine />
            }
          />
        </ActionButton>
      </Box>
    </Box>
  );
}
