import { Command } from "effect/unstable/cli";
import {
  commentsCommand,
  draftCommand,
  infoCommand,
  membersCommand,
  redoLogsCommand,
  settingsCommand,
  worksCommand,
} from "./commands.js";
import { listCommand } from "./list.js";

export const commonHomework = Command.make("common").pipe(
  Command.withDescription("Inspect common Educoder homework workflows, metadata, members, settings, and work status."),
  Command.withExamples([
    {
      command: "open-educoder homework common list MOAPGNLO --sort-by position --sort-direction desc",
      description: "List common homeworks in a course",
    },
    {
      command: "open-educoder homework common info 3487339",
      description: "Inspect a common homework by homework ID",
    },
    {
      command: "open-educoder homework common works 109348 3487339",
      description: "Inspect current work status for a common homework",
    },
    {
      command: "open-educoder homework common settings 109348 3487339",
      description: "Inspect common homework settings",
    },
  ]),
  Command.withAlias("c"),
  Command.withSubcommands([
    listCommand,
    infoCommand,
    worksCommand,
    draftCommand,
    membersCommand,
    commentsCommand,
    settingsCommand,
    redoLogsCommand,
  ]),
);
