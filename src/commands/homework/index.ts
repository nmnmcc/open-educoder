import { Command } from "effect/unstable/cli";

import { Common } from "./common/index.js";
import { List } from "./list.js";
import { Shixun } from "./shixun/index.js";

export const Homework = Command.make("homework").pipe(
  Command.withDescription("Work with homework by category: common assignments or shixun tasks."),
  Command.withExamples([
    {
      command: "open-educoder homework list 109348 --type all",
      description: "List homework with explicit ID labels and next commands",
    },
    {
      command: "open-educoder homework common works 109348 3487339",
      description: "Check a common assignment work summary",
    },
    {
      command: "open-educoder homework shixun challenges 109348 3487324",
      description: "List shixun challenges for one homework",
    },
    {
      command: "open-educoder homework shixun content 109348 3487324 case1/code.sh",
      description: "Read one file from a shixun task repository without manually finding task-id",
    },
  ]),
  Command.withAlias("h"),
  Command.withSubcommands([List, Common, Shixun]),
);
