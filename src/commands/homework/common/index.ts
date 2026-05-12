import { Command } from "effect/unstable/cli";

import { Comments, Draft, Info, Members, RedoLogs, Settings, Works } from "./commands.js";
import { List } from "./list.js";

export const Common = Command.make("common").pipe(
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
  Command.withSubcommands([List, Info, Works, Draft, Members, Comments, Settings, RedoLogs]),
);
