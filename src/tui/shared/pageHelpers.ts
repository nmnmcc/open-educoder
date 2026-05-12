import type { UiActions } from "../app/types.js";
import { asRecord, compactJson, stringValue } from "../ui/index.js";

export const nonNegativeNumber = (value: string, fallback: number) => {
  const parsed = Number.parseInt(value.trim(), 10);

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

export const askRequired = async (ui: UiActions, title: string, label: string, initialValue = "") => {
  const value = await ui.prompt(title, label, initialValue);
  const trimmed = value?.trim() ?? "";

  return trimmed.length >= 1 ? trimmed : null;
};

export const inferTaskId = (value: unknown) => {
  const operation = asRecord(asRecord(value)["operation"]);
  const path = stringValue(operation["path"]);
  const candidates = path
    .replace(/[?#].*$/, "")
    .split("/")
    .map((part) => part.trim())
    .filter((part) => part.length >= 1);

  return candidates.at(-1);
};

export const selectedRecord = (data: unknown, id: string) => asRecord(asRecord(data)[id]);

export const renderResult = (value: unknown) => {
  const rendered = compactJson(value);

  return rendered.length > 1800 ? `${rendered.slice(0, 1800)}\n...` : rendered;
};
