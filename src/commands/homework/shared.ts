import { readFile } from "node:fs/promises";

import { Console, Effect, Option } from "effect";

import {
  HomeworkInputError,
  asRecord,
  failInput,
  formatStatusResponse,
  optionToUndefined,
  stringField,
} from "../../services/features/homework/shared.js";
import { inspectOptions } from "../../utils/inspect-options.js";

export {
  HomeworkInputError,
  asRecord,
  failInput,
  formatStatusResponse,
  inspectOptions,
  optionToUndefined,
  stringField,
};

export const printJson = (value: unknown) => Console.log(JSON.stringify(value, null, 2));

export const readContent = Effect.fn("homework.readContent")(function* (input: {
  readonly content: Option.Option<string>;
  readonly file: Option.Option<string>;
}) {
  if (Option.isSome(input.content) && Option.isSome(input.file)) {
    return yield* failInput("Use either --content or --file, not both.");
  }

  if (Option.isSome(input.content)) {
    return input.content.value;
  }

  if (Option.isSome(input.file)) {
    const file = input.file.value;

    return yield* Effect.tryPromise({
      try: () => readFile(file, "utf8"),
      catch: (error) =>
        new HomeworkInputError({
          message: `Failed to read ${file}: ${error instanceof Error ? error.message : String(error)}`,
        }),
    });
  }

  return yield* failInput("Provide file content with --content or --file.");
});

export const printStatusResponse = Effect.fn("homework.printStatusResponse")(function* (
  response: unknown,
  json: boolean,
) {
  if (json) {
    return yield* printJson(response);
  }

  yield* Console.dir(formatStatusResponse(response), inspectOptions);
});
