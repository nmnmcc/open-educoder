import { Command } from "effect/unstable/cli";

import { LabSubcommands } from "./subcommands.js";

export const Labs = Command.make("labs").pipe(
  Command.withDescription(
    "Lab assignment workspace operations: tasks, repository files, evaluation, and environment actions.",
  ),
  Command.withExamples([
    {
      command: "open-educoder assignments labs challenges 109348 3487324",
      description: "List challenge indexes and IDs",
    },
    {
      command: "open-educoder assignments labs task 109348 3487324 --challenge-index 1",
      description: "Resolve and show a task without manually finding task-id",
    },
    {
      command: "open-educoder assignments labs learning 109348 3487324 --challenge-index 1",
      description: "Show one challenge's learning content",
    },
    {
      command:
        "open-educoder assignments labs evaluate 109348 3487324 case1/code.sh --file ./code.sh --poll --challenge-index 1",
      description: "Save a file and wait for evaluation result",
    },
    {
      command: "open-educoder assignments labs repository 109348 3487324 --path case1",
      description: "Browse repository contents under a path",
    },
  ]),
  Command.withAlias("b"),
  Command.withSubcommands(LabSubcommands),
);
