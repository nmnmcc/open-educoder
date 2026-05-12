import { Command } from "effect/unstable/cli";

import { Common } from "./common/index.js";
import { Shixun } from "./shixun/index.js";

export const Homework = Command.make("homework").pipe(
  Command.withDescription("Work with homework by category: common assignments or shixun tasks."),
  Command.withExamples([
    {
      command: "open-educoder homework common list MOAPGNLO --sort-by position --sort-direction desc",
      description: "List all common assignments for a course",
    },
    {
      command: "open-educoder homework common works 109348 3487339",
      description: "Check a common assignment work summary",
    },
    {
      command: "open-educoder homework shixun list MOAPGNLO --category 1213302",
      description: "List shixun tasks in a course category",
    },
    {
      command: "open-educoder homework shixun content sflmr2fxi4wn case1/code.sh --homework-id 3487324",
      description: "Read one file from a shixun task repository",
    },
  ]),
  Command.withAlias("h"),
  Command.withSubcommands([Common, Shixun]),
);
