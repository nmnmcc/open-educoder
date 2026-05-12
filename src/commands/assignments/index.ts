import { Command } from "effect/unstable/cli";

import { Common } from "./common/index.js";
import { List } from "./list.js";
import { Labs } from "./labs/index.js";

export const Assignments = Command.make("assignments").pipe(
  Command.withDescription("Work with assignments by category: common assignments or lab assignments."),
  Command.withExamples([
    {
      command: "open-educoder assignments list 109348 --type all",
      description: "List assignments with explicit ID labels and next commands",
    },
    {
      command: "open-educoder assignments common work 109348 3487339",
      description: "Check a common assignment work summary",
    },
    {
      command: "open-educoder assignments labs challenges 109348 3487324",
      description: "List lab challenges for one assignment",
    },
    {
      command: "open-educoder assignments labs content 109348 3487324 case1/code.sh",
      description: "Read one file from a lab task repository without manually finding task-id",
    },
  ]),
  Command.withAlias("a"),
  Command.withSubcommands([List, Common, Labs]),
);
