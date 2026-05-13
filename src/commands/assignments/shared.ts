import { readFile } from "node:fs/promises";

import { Console, Effect, Option } from "effect";

import {
  AssignmentInputError,
  failInput,
  formatStatusResponse,
  optionToUndefined,
  runningStatusMessage,
} from "../../services/features/assignments/shared.js";
import { inspectOptions } from "../../utils/inspect-options.js";
import { readStdinText } from "../../utils/stdin.js";
import { renderGeneric } from "./render.js";

export {
  AssignmentInputError,
  failInput,
  formatStatusResponse,
  inspectOptions,
  optionToUndefined,
  runningStatusMessage,
};

export const printJson = (value: unknown) => Console.log(JSON.stringify(value, null, 2));

export const readContent = Effect.fn("assignments.readContent")(function* (input: {
  readonly content: Option.Option<string>;
  readonly file: Option.Option<string>;
  readonly stdin: boolean;
}) {
  const content = yield* readOptionalContent(input);

  if (content !== undefined) {
    return content;
  }

  return yield* failInput("Provide file content with --content, --file, or --stdin.");
});

export const readOptionalContent = Effect.fn("assignments.readOptionalContent")(function* (input: {
  readonly content: Option.Option<string>;
  readonly file: Option.Option<string>;
  readonly stdin: boolean;
}) {
  const selectedSources =
    Number(Option.isSome(input.content)) + Number(Option.isSome(input.file)) + Number(input.stdin);

  if (selectedSources >= 2) {
    return yield* failInput("Use only one of --content, --file, or --stdin.");
  }

  if (Option.isSome(input.content)) {
    return input.content.value;
  }

  if (Option.isSome(input.file)) {
    const file = input.file.value;

    return yield* Effect.tryPromise({
      try: () => readFile(file, "utf8"),
      catch: (error) =>
        new AssignmentInputError({
          message: `Failed to read ${file}: ${error instanceof Error ? error.message : String(error)}`,
        }),
    });
  }

  if (input.stdin) {
    return yield* readStdinText((message) => new AssignmentInputError({ message: String(message) }));
  }

  return undefined;
});

export const requireChallengeSelector = Effect.fn("assignments.requireChallengeSelector")(function* (input: {
  readonly challengeIndex: Option.Option<number>;
  readonly challengeId: Option.Option<number>;
}) {
  if (Option.isNone(input.challengeIndex) && Option.isNone(input.challengeId)) {
    return yield* failInput("Missing required flag: --challenge-index (or --challenge-id).");
  }
});

export const printStatusResponse = Effect.fn("assignments.printStatusResponse")(function* (
  response: Parameters<typeof formatStatusResponse>[0],
  json: boolean,
) {
  if (json) {
    return yield* printJson(response);
  }

  yield* Console.log(renderGeneric("评测状态 / Evaluation Status", formatStatusResponse(response)));
});
