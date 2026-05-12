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
  Command.withDescription("Start the interactive terminal UI for quick task inspection."),
  Command.withExamples([
    {
      command: "open-educoder tui",
      description: "Open the interactive UI mode",
    },
  ]),
  Command.withAlias("t"),
);
