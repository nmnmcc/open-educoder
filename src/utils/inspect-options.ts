import type { InspectOptions } from "node:util";

export const inspectOptions = {
  colors: true,
  depth: null,
  maxArrayLength: null,
  maxStringLength: null,
} satisfies InspectOptions;
