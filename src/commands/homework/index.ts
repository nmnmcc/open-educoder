import { Command } from "effect/unstable/cli";
import { Common } from "./common/index.js";
import { Shixun } from "./shixun/index.js";

export const Homework = Command.make("homework").pipe(
  Command.withDescription("Inspect and operate Educoder homework workflows by homework type."),
  Command.withExamples([
    {
      command: "open-educoder homework common list MOAPGNLO --sort-by position --sort-direction desc",
      description: "List common homework in a course",
    },
    {
      command: "open-educoder homework common works 109348 3487339",
      description: "Inspect common homework work status",
    },
    {
      command: "open-educoder homework shixun list MOAPGNLO --category 1213302",
      description: "List shixun homework in a course category",
    },
    {
      command: "open-educoder homework shixun content sflmr2fxi4wn case1/code.sh --homework-id 3487324",
      description: "Read a shixun task repository file",
    },
  ]),
  Command.withAlias("h"),
  Command.withSubcommands([Common, Shixun]),
);
