import { Command } from "effect/unstable/cli";

import { ShixunSubcommands } from "./subcommands.js";

export const Shixun = Command.make("shixun").pipe(
  Command.withDescription(
    "Shixun homework workspace operations: tasks, repository files, evaluation, and environment actions.",
  ),
  Command.withExamples([
    {
      command: "open-educoder homework shixun challenges 109348 3487324",
      description: "List challenge indexes and IDs",
    },
    {
      command: "open-educoder homework shixun task 109348 3487324 --challenge-index 1",
      description: "Resolve and show a task without manually finding task-id",
    },
    {
      command:
        "open-educoder homework shixun evaluate 109348 3487324 case1/code.sh --file ./code.sh --poll --challenge-index 1",
      description: "Save a file and wait for evaluation result",
    },
    {
      command: "open-educoder homework shixun repository 109348 3487324 --path case1",
      description: "Browse repository contents under a path",
    },
  ]),
  Command.withAlias("x"),
  Command.withSubcommands(ShixunSubcommands),
);
