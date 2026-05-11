import { Command } from "effect/unstable/cli";
import { buildCommand } from "./build.js";
import { commitFilesCommand } from "./commit-files.js";
import { contentCommand } from "./content.js";
import { editCommand } from "./edit.js";
import { evaluateCommand } from "./evaluate.js";
import { listCommand } from "./list.js";
import { logOutputCommand } from "./log-output.js";
import { pullFilesCommand } from "./pull-files.js";
import { saveCommand } from "./save.js";
import { statusCommand } from "./status.js";
import { taskCommand } from "./task.js";
import { sshCommand } from "./ssh.js";

export const homework = Command.make("homework").pipe(
  Command.withDescription(
    "Inspect and operate Educoder homework workflows, including shixun task files and evaluation.",
  ),
  Command.withExamples([
    {
      command: "open-educoder homework list MOAPGNLO --type shixun --category 1213302",
      description: "List shixun homework in a course category",
    },
    {
      command: "open-educoder homework content sflmr2fxi4wn case1/code.sh --homework-id 3487324",
      description: "Read a task repository file",
    },
    {
      command: "open-educoder homework edit sflmr2fxi4wn case1/code.sh --homework-id 3487324",
      description: "Edit a task repository file",
    },
    {
      command:
        "open-educoder homework evaluate sflmr2fxi4wn case1/code.sh --homework-id 3487324 --file ./code.sh --poll",
      description: "Save a file and poll the evaluation status",
    },
  ]),
  Command.withAlias("h"),
  Command.withSubcommands([
    listCommand,
    taskCommand,
    contentCommand,
    editCommand,
    saveCommand,
    buildCommand,
    statusCommand,
    evaluateCommand,
    logOutputCommand,
    commitFilesCommand,
    pullFilesCommand,
    sshCommand,
  ]),
);
