/** @jsxImportSource @opentui/react */
import { type KeyEvent, createTextAttributes } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { Effect } from "effect";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { formatError } from "../runtime/process.js";

export type RemoteData<A> =
  | {
      readonly tag: "loading";
    }
  | {
      readonly tag: "success";
      readonly value: A;
    }
  | {
      readonly tag: "error";
      readonly error: string;
    };

export type SelectItem = {
  readonly id: string;
  readonly label: string;
  readonly description?: string | undefined;
  readonly meta?: string | undefined;
};

export const Colors = {
  cyan: "#00ffff",
  gray: "#808080",
  green: "#50fa7b",
  red: "#ff5555",
  yellow: "#ffff00",
} as const;

export const TextAttrs = {
  bold: createTextAttributes({ bold: true }),
  dim: createTextAttributes({ dim: true }),
  boldDim: createTextAttributes({ bold: true, dim: true }),
} as const;

const normalizedKeyName = (event: KeyEvent) => event.name.toLowerCase().replaceAll("-", "");

export const keyText = (event: KeyEvent) => {
  if (event.name === "space") {
    return " ";
  }

  if (event.sequence.length === 1 && event.sequence >= " ") {
    return event.sequence;
  }

  return event.name.length === 1 ? event.name : "";
};

export const isKeyName = (event: KeyEvent, name: string) => normalizedKeyName(event) === name;

export const isEnterKey = (event: KeyEvent) => {
  const name = normalizedKeyName(event);

  return name === "return" || name === "enter" || name === "linefeed";
};

export const isEscapeKey = (event: KeyEvent) => {
  const name = normalizedKeyName(event);

  return name === "escape" || name === "esc";
};

export const isBackspaceKey = (event: KeyEvent) => normalizedKeyName(event) === "backspace";

export const isDeleteKey = (event: KeyEvent) => {
  const name = normalizedKeyName(event);

  return name === "delete" || name === "del";
};

export const useRemoteData = <A, E>(key: string, load: () => Effect.Effect<A, E>): RemoteData<A> => {
  const [data, setData] = useState<RemoteData<A>>({ tag: "loading" });

  useEffect(() => {
    let active = true;

    setData({ tag: "loading" });
    Effect.runPromise(load()).then(
      (value) => {
        if (active) {
          setData({ tag: "success", value });
        }
      },
      (error: unknown) => {
        if (active) {
          setData({ tag: "error", error: formatError(error) });
        }
      },
    );

    return () => {
      active = false;
    };
  }, [key]);

  return data;
};

export const useSelectedIndex = (length: number, key: string) => {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    setSelected(0);
  }, [key]);

  useEffect(() => {
    if (length < 1) {
      setSelected(0);
      return;
    }

    setSelected((value) => Math.min(value, length - 1));
  }, [length]);

  return [selected, setSelected] as const;
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const asRecord = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {});

export const stringValue = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

export const numberValue = (value: unknown, fallback = 0) => (typeof value === "number" ? value : fallback);

export const booleanValue = (value: unknown, fallback = false) => (typeof value === "boolean" ? value : fallback);

export const optionalText = (value: unknown) => {
  if (typeof value === "string" && value.length >= 1) {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return null;
};

export const objectEntries = (value: unknown) => Object.entries(asRecord(value));

export const compactJson = (value: unknown) => JSON.stringify(value, null, 2) ?? String(value);

export function Page({
  title,
  subtitle,
  children,
  footer,
}: {
  readonly title: string;
  readonly subtitle?: string | undefined;
  readonly children: ReactNode;
  readonly footer?: string | undefined;
}) {
  return (
    <box flexDirection="column" height="100%">
      <box border borderStyle="single" borderColor={Colors.cyan} paddingX={1} flexDirection="column">
        <text attributes={TextAttrs.bold} wrapMode="word">
          {title}
        </text>
        {subtitle !== undefined && subtitle.length >= 1 ? (
          <text fg={Colors.gray} attributes={TextAttrs.dim} wrapMode="word">
            {subtitle}
          </text>
        ) : null}
      </box>
      <box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
        {children}
      </box>
      <box border borderStyle="single" borderColor={Colors.gray} paddingX={1}>
        <text fg={Colors.gray} attributes={TextAttrs.dim} wrapMode="word">
          {footer ?? "Enter open  Esc back  q quit"}
        </text>
      </box>
    </box>
  );
}

export function RemotePane<A>({
  data,
  children,
}: {
  readonly data: RemoteData<A>;
  readonly children: (value: A) => ReactNode;
}) {
  if (data.tag === "loading") {
    return (
      <text fg={Colors.yellow} wrapMode="word">
        Loading...
      </text>
    );
  }

  if (data.tag === "error") {
    return (
      <text fg={Colors.red} wrapMode="word">
        {data.error}
      </text>
    );
  }

  return <>{children(data.value)}</>;
}

export function SelectList({
  items,
  selected,
  onSelectedChange,
  onOpen,
  active,
  empty,
}: {
  readonly items: ReadonlyArray<SelectItem>;
  readonly selected: number;
  readonly onSelectedChange: (next: number) => void;
  readonly onOpen: (item: SelectItem) => void;
  readonly active: boolean;
  readonly empty?: string | undefined;
}) {
  const { height } = useTerminalDimensions();
  const visibleCount = Math.max(1, height - 8);
  const start = Math.max(
    0,
    Math.min(selected - Math.floor(visibleCount / 2), Math.max(0, items.length - visibleCount)),
  );
  const visibleItems = items.slice(start, start + visibleCount);

  useKeyboard((event) => {
    if (!active || items.length < 1) {
      return;
    }

    if (isKeyName(event, "up")) {
      onSelectedChange(Math.max(0, selected - 1));
      return;
    }

    if (isKeyName(event, "down")) {
      onSelectedChange(Math.min(items.length - 1, selected + 1));
      return;
    }

    if (isKeyName(event, "pageup")) {
      onSelectedChange(Math.max(0, selected - visibleCount));
      return;
    }

    if (isKeyName(event, "pagedown")) {
      onSelectedChange(Math.min(items.length - 1, selected + visibleCount));
      return;
    }

    if (isKeyName(event, "home")) {
      onSelectedChange(0);
      return;
    }

    if (isKeyName(event, "end")) {
      onSelectedChange(items.length - 1);
      return;
    }

    if (isEnterKey(event)) {
      const item = items[selected];

      if (item !== undefined) {
        onOpen(item);
      }
    }
  });

  if (items.length < 1) {
    return (
      <text fg={Colors.gray} attributes={TextAttrs.dim} wrapMode="word">
        {empty ?? "No items."}
      </text>
    );
  }

  return (
    <box flexDirection="column">
      {visibleItems.map((item, index) => {
        const absoluteIndex = start + index;
        const focused = absoluteIndex === selected;

        return (
          <box key={item.id} flexDirection="column">
            {focused ? (
              <text fg={Colors.cyan} attributes={TextAttrs.bold} wrapMode="word">
                &gt; {item.label}
                {item.meta !== undefined && item.meta.length >= 1 ? <span fg={Colors.gray}> {item.meta}</span> : null}
              </text>
            ) : (
              <text wrapMode="word">
                {"  "}
                {item.label}
                {item.meta !== undefined && item.meta.length >= 1 ? <span fg={Colors.gray}> {item.meta}</span> : null}
              </text>
            )}
            {item.description !== undefined && item.description.length >= 1 ? (
              <text fg={Colors.gray} attributes={TextAttrs.dim} wrapMode="word">
                {" "}
                {item.description}
              </text>
            ) : null}
          </box>
        );
      })}
      {items.length > visibleCount ? (
        <text fg={Colors.gray} attributes={TextAttrs.dim} wrapMode="word">
          {selected + 1}/{items.length}
        </text>
      ) : null}
    </box>
  );
}

export function KeyHints({ hints }: { readonly hints: ReadonlyArray<string> }) {
  return (
    <box flexWrap="wrap">
      {hints.map((hint, index) => (
        <text key={`${hint}-${index}`} fg={Colors.gray} attributes={TextAttrs.dim} wrapMode="word">
          {index === 0 ? "" : "  "}
          {hint}
        </text>
      ))}
    </box>
  );
}

export function FieldList({ fields }: { readonly fields: ReadonlyArray<readonly [string, unknown]> }) {
  return (
    <box flexDirection="column">
      {fields.map(([label, value]) => (
        <text key={label} wrapMode="word">
          <span fg={Colors.cyan}>{label}</span>: {optionalText(value) ?? "-"}
        </text>
      ))}
    </box>
  );
}

export function JsonBlock({ value }: { readonly value: unknown }) {
  const { height } = useTerminalDimensions();
  const lines = useMemo(() => compactJson(value).split("\n"), [value]);
  const visible = lines.slice(0, Math.max(1, height - 7));

  return (
    <box flexDirection="column">
      {visible.map((line, index) => (
        <text key={index}>{line}</text>
      ))}
      {visible.length < lines.length ? (
        <text fg={Colors.gray} attributes={TextAttrs.dim} wrapMode="word">
          ... {lines.length - visible.length} more lines
        </text>
      ) : null}
    </box>
  );
}

export function TextPrompt({
  title,
  label,
  initialValue,
  onSubmit,
  onCancel,
}: {
  readonly title: string;
  readonly label: string;
  readonly initialValue: string;
  readonly onSubmit: (value: string) => void;
  readonly onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);

  useKeyboard((event) => {
    if (isEscapeKey(event)) {
      onCancel();
      return;
    }

    if (isEnterKey(event)) {
      onSubmit(value);
      return;
    }

    if (isBackspaceKey(event) || isDeleteKey(event)) {
      setValue((current) => current.slice(0, -1));
      return;
    }

    const input = keyText(event);

    if (!event.ctrl && input.length >= 1) {
      setValue((current) => `${current}${input}`);
    }
  });

  return (
    <box border borderStyle="rounded" borderColor={Colors.yellow} paddingX={1} flexDirection="column">
      <text attributes={TextAttrs.bold} wrapMode="word">
        {title}
      </text>
      <text wrapMode="word">
        {label}: <span fg={Colors.cyan}>{value}</span>
      </text>
      <text fg={Colors.gray} attributes={TextAttrs.dim} wrapMode="word">
        Enter confirm Esc cancel
      </text>
    </box>
  );
}

export function DangerPrompt({
  title,
  message,
  expected,
  onConfirm,
  onCancel,
}: {
  readonly title: string;
  readonly message: string;
  readonly expected: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const matches = value === expected;

  useKeyboard((event) => {
    if (isEscapeKey(event)) {
      onCancel();
      return;
    }

    if (isEnterKey(event)) {
      if (matches) {
        onConfirm();
      }
      return;
    }

    if (isBackspaceKey(event) || isDeleteKey(event)) {
      setValue((current) => current.slice(0, -1));
      return;
    }

    const input = keyText(event);

    if (!event.ctrl && input.length >= 1) {
      setValue((current) => `${current}${input}`);
    }
  });

  return (
    <box border borderStyle="rounded" borderColor={Colors.red} paddingX={1} flexDirection="column">
      <text fg={Colors.red} attributes={TextAttrs.bold} wrapMode="word">
        {title}
      </text>
      <text wrapMode="word">{message}</text>
      <text wrapMode="word">
        Type <span fg={Colors.yellow}>{expected}</span>: <span fg={matches ? Colors.green : Colors.cyan}>{value}</span>
      </text>
      <text fg={Colors.gray} attributes={TextAttrs.dim} wrapMode="word">
        Enter confirm after exact match Esc cancel
      </text>
    </box>
  );
}

export function MessageBox({
  title,
  message,
  value,
  tone,
  onClose,
}: {
  readonly title: string;
  readonly message?: string | undefined;
  readonly value?: unknown;
  readonly tone: "info" | "error";
  readonly onClose: () => void;
}) {
  const color = tone === "error" ? Colors.red : Colors.green;

  useKeyboard((event) => {
    if (isEnterKey(event) || isEscapeKey(event)) {
      onClose();
    }
  });

  return (
    <box border borderStyle="rounded" borderColor={color} paddingX={1} flexDirection="column">
      <text fg={color} attributes={TextAttrs.bold} wrapMode="word">
        {title}
      </text>
      {message !== undefined ? <text wrapMode="word">{message}</text> : null}
      {value !== undefined ? <JsonBlock value={value} /> : null}
      <text fg={Colors.gray} attributes={TextAttrs.dim} wrapMode="word">
        Enter close Esc close
      </text>
    </box>
  );
}
