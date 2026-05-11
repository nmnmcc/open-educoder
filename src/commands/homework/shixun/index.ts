import { Command } from "effect/unstable/cli";
import { Build } from "./build.js";
import { CommitFiles } from "./commit-files.js";
import { Content } from "./content.js";
import { Edit } from "./edit.js";
import { Evaluate } from "./evaluate.js";
import { List } from "./list.js";
import { LogOutput } from "./log-output.js";
import { PassedCode } from "./passed-code.js";
import { PruneVersions } from "./prune-versions.js";
import { PullFiles } from "./pull-files.js";
import { RemainingTime } from "./remaining-time.js";
import { Repository } from "./repository.js";
import { Reset } from "./reset.js";
import { Save } from "./save.js";
import { Status } from "./status.js";
import { Task } from "./task.js";
import { Ssh } from "./ssh.js";

export const Shixun = Command.make("shixun").pipe(
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
    List,
    Task,
    Content,
    Repository,
    PassedCode,
    Edit,
    Save,
    Build,
    Status,
    Evaluate,
    LogOutput,
    CommitFiles,
    PullFiles,
    Reset,
    RemainingTime,
    PruneVersions,
    Ssh,
  ]),
);
