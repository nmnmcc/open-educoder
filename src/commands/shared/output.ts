export type TableColumn<Row> = {
  readonly header: string;
  readonly value: (row: Row) => unknown;
  readonly minWidth?: number;
};

export type Field = readonly [label: string, value: unknown];

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const record = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {});

export const array = (value: unknown): ReadonlyArray<unknown> => (Array.isArray(value) ? value : []);

const isScalar = (value: unknown) =>
  value === null ||
  value === undefined ||
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean" ||
  typeof value === "bigint";

const isInlineValue = (value: unknown) => isScalar(value) || (Array.isArray(value) && value.every(isScalar));

const singleLine = (value: string) => value.replace(/\s+/g, " ").trim();

const labelText = (value: string) => {
  const normalized = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .replace(/\bId\b/g, "ID")
    .replace(/\bUrl\b/g, "URL")
    .replace(/\bApi\b/g, "API")
    .replace(/\bJson\b/g, "JSON")
    .replace(/\bSsh\b/g, "SSH");
};

export const formatValue = (value: unknown, fallback = "-"): string => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value ? "yes" : "no";
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }

  if (typeof value === "string") {
    return value.length >= 1 ? value : fallback;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return fallback;
    }

    return value.map((item) => formatValue(item, fallback)).join(", ");
  }

  if (isRecord(value)) {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return fallback;
    }

    return entries.map(([key, item]) => `${key}=${formatValue(item, fallback)}`).join(" ");
  }

  return String(value);
};

const tableValue = (value: unknown) => singleLine(formatValue(value));

const padEnd = (value: string, width: number) => value + " ".repeat(Math.max(0, width - value.length));

export const renderTable = <Row>(rows: ReadonlyArray<Row>, columns: ReadonlyArray<TableColumn<Row>>): string => {
  if (rows.length === 0 || columns.length === 0) {
    return "";
  }

  const cells = rows.map((row) => columns.map((column) => tableValue(column.value(row))));
  const widths = columns.map((column, index) => {
    const columnCells = cells.map((row) => row[index] ?? "");
    const contentWidth = Math.max(column.header.length, ...columnCells.map((cell) => cell.length));

    return Math.max(column.minWidth ?? 0, contentWidth);
  });
  const renderRow = (values: ReadonlyArray<string>) =>
    values.map((value, index) => (index === values.length - 1 ? value : padEnd(value, widths[index] ?? 0))).join("  ");

  return [renderRow(columns.map((column) => column.header)), ...cells.map(renderRow)].join("\n");
};

export const renderFields = (fields: ReadonlyArray<Field>, indent = 2): string => {
  if (fields.length === 0) {
    return "";
  }

  const labels = fields.map(([label]) => label);
  const width = Math.max(...labels.map((label) => label.length));
  const spaces = " ".repeat(indent);
  const lines: Array<string> = [];

  for (const [label, value] of fields) {
    const formatted = formatValue(value);
    const valueLines = formatted.split("\n");
    const head = valueLines[0] ?? "-";

    lines.push(`${spaces}${label.padStart(width)}: ${head}`);

    for (const tail of valueLines.slice(1)) {
      lines.push(`${spaces}${" ".repeat(width)}  ${tail}`);
    }
  }

  return lines.join("\n");
};

const appendDetails = (lines: Array<string>, value: unknown, indent: number): void => {
  const spaces = " ".repeat(indent);

  if (isInlineValue(value)) {
    lines.push(`${spaces}${formatValue(value)}`);
    return;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      lines.push(`${spaces}-`);
      return;
    }

    for (const [index, item] of value.entries()) {
      lines.push(`${spaces}[${index + 1}]:`);
      appendDetails(lines, item, indent + 2);
    }

    return;
  }

  const valueRecord = record(value);
  const entries = Object.entries(valueRecord);

  if (entries.length === 0) {
    lines.push(`${spaces}-`);
    return;
  }

  const scalarEntries = entries.filter(([, item]) => isInlineValue(item));
  const nestedEntries = entries.filter(([, item]) => !isInlineValue(item));

  if (scalarEntries.length >= 1) {
    const width = Math.max(...scalarEntries.map(([key]) => labelText(key).length));

    for (const [key, item] of scalarEntries) {
      const label = labelText(key);
      const formatted = formatValue(item);
      const valueLines = formatted.split("\n");

      lines.push(`${spaces}${label.padStart(width)}: ${valueLines[0] ?? "-"}`);

      for (const tail of valueLines.slice(1)) {
        lines.push(`${spaces}${" ".repeat(width)}  ${tail}`);
      }
    }
  }

  for (const [key, item] of nestedEntries) {
    if (scalarEntries.length >= 1) {
      lines.push("");
    }

    lines.push(`${spaces}${labelText(key)}:`);
    appendDetails(lines, item, indent + 2);
  }
};

export const renderDetails = (title: string, value: unknown) => {
  const lines = [title];

  appendDetails(lines, value, 2);

  return lines.join("\n").trimEnd();
};

export const renderListedCount = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural} listed.`;
