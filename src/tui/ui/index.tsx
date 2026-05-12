import { Effect } from "effect";
import { Box, Text, useInput, useWindowSize } from "ink";
import { useEffect, useMemo, useState } from "react";

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
  readonly children: React.ReactNode;
  readonly footer?: string | undefined;
}) {
  return (
    <Box flexDirection="column" height="100%">
      <Box borderStyle="single" borderColor="cyan" paddingX={1} flexDirection="column">
        <Text bold>{title}</Text>
        {subtitle !== undefined && subtitle.length >= 1 ? <Text dimColor>{subtitle}</Text> : null}
      </Box>
      <Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
        {children}
      </Box>
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Text dimColor>{footer ?? "Enter open  Esc back  q quit"}</Text>
      </Box>
    </Box>
  );
}

export function RemotePane<A>({
  data,
  children,
}: {
  readonly data: RemoteData<A>;
  readonly children: (value: A) => React.ReactNode;
}) {
  if (data.tag === "loading") {
    return <Text color="yellow">Loading...</Text>;
  }

  if (data.tag === "error") {
    return <Text color="red">{data.error}</Text>;
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
  const size = useWindowSize();
  const visibleCount = Math.max(1, size.rows - 8);
  const start = Math.max(
    0,
    Math.min(selected - Math.floor(visibleCount / 2), Math.max(0, items.length - visibleCount)),
  );
  const visibleItems = items.slice(start, start + visibleCount);

  useInput(
    (_input, key) => {
      if (items.length < 1) {
        return;
      }

      if (key.upArrow) {
        onSelectedChange(Math.max(0, selected - 1));
        return;
      }

      if (key.downArrow) {
        onSelectedChange(Math.min(items.length - 1, selected + 1));
        return;
      }

      if (key.pageUp) {
        onSelectedChange(Math.max(0, selected - visibleCount));
        return;
      }

      if (key.pageDown) {
        onSelectedChange(Math.min(items.length - 1, selected + visibleCount));
        return;
      }

      if (key.home) {
        onSelectedChange(0);
        return;
      }

      if (key.end) {
        onSelectedChange(items.length - 1);
        return;
      }

      if (key.return) {
        const item = items[selected];

        if (item !== undefined) {
          onOpen(item);
        }
      }
    },
    { isActive: active },
  );

  if (items.length < 1) {
    return <Text dimColor>{empty ?? "No items."}</Text>;
  }

  return (
    <Box flexDirection="column">
      {visibleItems.map((item, index) => {
        const absoluteIndex = start + index;
        const focused = absoluteIndex === selected;

        return (
          <Box key={item.id} flexDirection="column">
            {focused ? (
              <Text color="cyan" bold>
                &gt; {item.label}
                {item.meta !== undefined && item.meta.length >= 1 ? <Text dimColor> {item.meta}</Text> : null}
              </Text>
            ) : (
              <Text>
                {"  "}
                {item.label}
                {item.meta !== undefined && item.meta.length >= 1 ? <Text dimColor> {item.meta}</Text> : null}
              </Text>
            )}
            {item.description !== undefined && item.description.length >= 1 ? (
              <Text dimColor> {item.description}</Text>
            ) : null}
          </Box>
        );
      })}
      {items.length > visibleCount ? (
        <Text dimColor>
          {selected + 1}/{items.length}
        </Text>
      ) : null}
    </Box>
  );
}

export function KeyHints({ hints }: { readonly hints: ReadonlyArray<string> }) {
  return (
    <Box flexWrap="wrap">
      {hints.map((hint, index) => (
        <Text key={`${hint}-${index}`} dimColor>
          {index === 0 ? "" : "  "}
          {hint}
        </Text>
      ))}
    </Box>
  );
}

export function FieldList({ fields }: { readonly fields: ReadonlyArray<readonly [string, unknown]> }) {
  return (
    <Box flexDirection="column">
      {fields.map(([label, value]) => (
        <Text key={label}>
          <Text color="cyan">{label}</Text>: {optionalText(value) ?? "-"}
        </Text>
      ))}
    </Box>
  );
}

export function JsonBlock({ value }: { readonly value: unknown }) {
  const size = useWindowSize();
  const lines = useMemo(() => compactJson(value).split("\n"), [value]);
  const visible = lines.slice(0, Math.max(1, size.rows - 7));

  return (
    <Box flexDirection="column">
      {visible.map((line, index) => (
        <Text key={index}>{line}</Text>
      ))}
      {visible.length < lines.length ? <Text dimColor>... {lines.length - visible.length} more lines</Text> : null}
    </Box>
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

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (key.return) {
      onSubmit(value);
      return;
    }

    if (key.backspace || key.delete) {
      setValue((current) => current.slice(0, -1));
      return;
    }

    if (!key.ctrl && input.length >= 1) {
      setValue((current) => `${current}${input}`);
    }
  });

  return (
    <Box borderStyle="round" borderColor="yellow" paddingX={1} flexDirection="column">
      <Text bold>{title}</Text>
      <Text>
        {label}: <Text color="cyan">{value}</Text>
      </Text>
      <Text dimColor>Enter confirm Esc cancel</Text>
    </Box>
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

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (key.return) {
      if (matches) {
        onConfirm();
      }
      return;
    }

    if (key.backspace || key.delete) {
      setValue((current) => current.slice(0, -1));
      return;
    }

    if (!key.ctrl && input.length >= 1) {
      setValue((current) => `${current}${input}`);
    }
  });

  return (
    <Box borderStyle="round" borderColor="red" paddingX={1} flexDirection="column">
      <Text bold color="red">
        {title}
      </Text>
      <Text>{message}</Text>
      <Text>
        Type <Text color="yellow">{expected}</Text>: <Text color={matches ? "green" : "cyan"}>{value}</Text>
      </Text>
      <Text dimColor>Enter confirm after exact match Esc cancel</Text>
    </Box>
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
  const color = tone === "error" ? "red" : "green";

  useInput((_input, key) => {
    if (key.return || key.escape) {
      onClose();
    }
  });

  return (
    <Box borderStyle="round" borderColor={color} paddingX={1} flexDirection="column">
      <Text bold color={color}>
        {title}
      </Text>
      {message !== undefined ? <Text>{message}</Text> : null}
      {value !== undefined ? <JsonBlock value={value} /> : null}
      <Text dimColor>Enter close Esc close</Text>
    </Box>
  );
}
