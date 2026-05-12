import { Effect } from "effect";
import { Command } from "effect/unstable/cli";

import { run } from "../tui/index.js";

export const Tui = Command.make(
  "tui",
  {},
  Effect.fn("tui")(function* () {
    return yield* run();
  }),
);
