import { List } from "./catalog/list.js";
import { Challenges } from "./context/challenges.js";
import { Choices } from "./context/choices.js";
import { Learning } from "./context/learning.js";
import { Task } from "./context/task.js";
import { Commit } from "./environment/commit.js";
import { Logs } from "./environment/logs.js";
import { Pull } from "./environment/pull.js";
import { RemainingTime } from "./environment/remaining-time.js";
import { Ssh } from "./environment/ssh.js";
import { Choose } from "./evaluation/choose.js";
import { Evaluate } from "./evaluation/evaluate.js";
import { Status } from "./evaluation/status.js";
import { Content } from "./repository/content.js";
import { Edit } from "./repository/edit.js";
import { Passed } from "./repository/passed.js";
import { Prune } from "./repository/prune.js";
import { Repository } from "./repository/repository.js";
import { Reset } from "./repository/reset.js";
import { Save } from "./repository/save.js";

export const LabSubcommands = [
  {
    group: "Discovery",
    commands: [List, Challenges, Choices, Task, Learning],
  },
  {
    group: "Repository",
    commands: [Repository, Content, Passed, Edit, Save, Reset, Prune],
  },
  {
    group: "Evaluation",
    commands: [Evaluate, Choose, Status],
  },
  {
    group: "Environment",
    commands: [Logs, Commit, Pull, RemainingTime, Ssh],
  },
] as const;
