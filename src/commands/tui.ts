import { Effect } from "effect";
import { Command } from "effect/unstable/cli";

import { run } from "../tui/index.js";

export const Tui = Command.make(
  "tui",
  {},
  Effect.fn("tui")(function* () {
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
