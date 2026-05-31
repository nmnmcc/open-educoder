import { Command } from "effect/unstable/cli";

import {
  Comments,
  Draft,
  Info,
  Members,
  RedoLogs,
  Settings,
  Submission,
  Submit,
  SupplyAttachments,
  UploadAttachments,
  Work,
  WorkComments,
} from "./commands.js";
import { List } from "./list.js";

export const Common = Command.make("common").pipe(
  Command.withDescription(
    "List common assignments, submit work, and inspect details, work state, comments, settings, and redo logs.",
  ),
  Command.withExamples([
    {
      command: "open-educoder assignments common list 109348 --sort-by position --sort-direction desc",
      description: "List common assignments",
    },
    {
      command: "open-educoder assignments common info 3487339",
      description: "Open assignment metadata and instructions",
    },
    {
      command: "open-educoder assignments common work 109348 3487339",
      description: "Check member work status summary",
    },
    {
      command: 'open-educoder assignments common submit 109348 3487337 ./report.doc --description "见附件。"',
      description: "Upload attachments and submit a common assignment",
    },
    {
      command: "open-educoder assignments common upload-attachments ./report.doc",
      description: "Upload attachments without submitting",
    },
    {
      command: "open-educoder assignments common settings 109348 3487339",
      description: "View assignment settings and constraints",
    },
  ]),
  Command.withAlias("c"),
  Command.withSubcommands([
    List,
    Info,
    Work,
    Draft,
    Submit,
    UploadAttachments,
    Submission,
    SupplyAttachments,
    WorkComments,
    Members,
    Comments,
    Settings,
    RedoLogs,
  ]),
);
