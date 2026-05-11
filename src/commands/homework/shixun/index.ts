import { Command } from "effect/unstable/cli";
import { buildCommand } from "./build.js";
import { commitFilesCommand } from "./commit-files.js";
import { contentCommand } from "./content.js";
import { editCommand } from "./edit.js";
import { evaluateCommand } from "./evaluate.js";
import { listCommand } from "./list.js";
import { logOutputCommand } from "./log-output.js";
import { passedCodeCommand } from "./passed-code.js";
import { pruneVersionsCommand } from "./prune-versions.js";
import { pullFilesCommand } from "./pull-files.js";
import { remainingTimeCommand } from "./remaining-time.js";
import { repositoryCommand } from "./repository.js";
import { resetCommand } from "./reset.js";
import { saveCommand } from "./save.js";
import { statusCommand } from "./status.js";
import { taskCommand } from "./task.js";
import { sshCommand } from "./ssh.js";

export const shixunHomework = Command.make("shixun").pipe(
  Command.withDescription("Inspect and operate Educoder shixun homework task files, repositories, and evaluations."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun list MOAPGNLO --category 1213302",
      description: "List shixun homework in a course category",
    },
    {
      command: "open-educoder homework shixun content sflmr2fxi4wn case1/code.sh --homework-id 3487324",
      description: "Read a task repository file",
    },
    {
      command:
        "open-educoder homework shixun evaluate sflmr2fxi4wn case1/code.sh --homework-id 3487324 --file ./code.sh --poll",
      description: "Save a file and poll the evaluation status",
    },
    {
      command: "open-educoder homework shixun repository sflmr2fxi4wn --homework-id 3487324 --path case1",
      description: "List repository files",
    },
  ]),
  Command.withAlias("x"),
  Command.withSubcommands([
    listCommand,
    taskCommand,
    contentCommand,
    repositoryCommand,
    passedCodeCommand,
    editCommand,
    saveCommand,
    buildCommand,
    statusCommand,
    evaluateCommand,
    logOutputCommand,
    commitFilesCommand,
    pullFilesCommand,
    resetCommand,
    remainingTimeCommand,
    pruneVersionsCommand,
    sshCommand,
  ]),
);
