import { Command } from "effect/unstable/cli";

import { ShixunSubcommands } from "./subcommands.js";

export const Shixun = Command.make("shixun").pipe(
  Command.withDescription("Shixun homework workspace operations: tasks, repository files, evaluation, and environment actions."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun list MOAPGNLO --category 1213302",
      description: "List shixun assignments in a course category",
    },
    {
      command: "open-educoder homework shixun content sflmr2fxi4wn case1/code.sh --homework-id 3487324",
      description: "Read a file from the task repository",
    },
    {
      command:
        "open-educoder homework shixun evaluate sflmr2fxi4wn case1/code.sh --homework-id 3487324 --file ./code.sh --poll",
      description: "Save a file and wait for evaluation result",
    },
    {
      command: "open-educoder homework shixun repository sflmr2fxi4wn --homework-id 3487324 --path case1",
      description: "Browse repository contents under a path",
    },
  ]),
  Command.withAlias("x"),
  Command.withSubcommands(ShixunSubcommands),
);
