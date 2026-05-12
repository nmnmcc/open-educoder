import { Box, Text } from "ink";

import { DangerPrompt, MessageBox, TextPrompt } from "../ui/index.js";
import type { Overlay } from "./types.js";

export function OverlayPane({ overlay, close }: { readonly overlay: Overlay; readonly close: () => void }) {
  if (overlay.type === "prompt") {
    return (
      <TextPrompt
        title={overlay.title}
        label={overlay.label}
        initialValue={overlay.initialValue}
        onSubmit={(value) => {
          overlay.resolve(value);
          close();
        }}
        onCancel={() => {
          overlay.resolve(null);
          close();
        }}
      />
    );
  }

  if (overlay.type === "danger") {
    return (
      <DangerPrompt
        title={overlay.title}
        message={overlay.message}
        expected={overlay.expected}
        onConfirm={() => {
          overlay.resolve(true);
          close();
        }}
        onCancel={() => {
          overlay.resolve(false);
          close();
        }}
      />
    );
  }

  if (overlay.type === "busy") {
    return (
      <Box borderStyle="round" borderColor="yellow" paddingX={1} flexDirection="column">
        <Text bold color="yellow">
          {overlay.title}
        </Text>
        <Text>{overlay.message}</Text>
      </Box>
    );
  }

  return (
    <MessageBox
      title={overlay.title}
      message={overlay.message}
      value={overlay.value}
      tone={overlay.tone}
      onClose={close}
    />
  );
}
