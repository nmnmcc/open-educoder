import { Effect } from "effect";
import { Command } from "effect/unstable/cli";

import { ensureOpenTuiRuntime } from "../tui/runtime/opentui.js";

export const Tui = Command.make(
  "tui",
  {},
  Effect.fn("tui")(function* () {
    yield* ensureOpenTuiRuntime();

    const { run } = yield* Effect.promise(() => import("../tui/index.js"));

    return yield* run();
  }),
).pipe(
  Command.withDescription("Open the interactive terminal UI for browsing courses, assignments, and exams."),
  Command.withExamples([
    {
      command: "open-educoder tui",
      description: "Open the interactive UI mode",
    },
  ]),
  Command.withAlias("t"),
);
