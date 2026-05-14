/** @jsxImportSource @opentui/react */
import { DangerPrompt, MessageBox, TextPrompt } from "../ui/index.js";
import { Colors, TextAttrs } from "../ui/index.js";
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
      <box border borderStyle="rounded" borderColor={Colors.yellow} paddingX={1} flexDirection="column">
        <text fg={Colors.yellow} attributes={TextAttrs.bold} wrapMode="word">
          {overlay.title}
        </text>
        <text wrapMode="word">{overlay.message}</text>
      </box>
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
