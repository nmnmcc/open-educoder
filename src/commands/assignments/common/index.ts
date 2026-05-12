import { Command } from "effect/unstable/cli";

import { Comments, Draft, Info, Members, RedoLogs, Settings, Work } from "./commands.js";
import { List } from "./list.js";

export const Common = Command.make("common").pipe(
  Command.withDescription("Common assignment actions: list tasks, view details, work status, and settings."),
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
      command: "open-educoder assignments common settings 109348 3487339",
      description: "View assignment settings and constraints",
    },
  ]),
  Command.withAlias("c"),
  Command.withSubcommands([List, Info, Work, Draft, Members, Comments, Settings, RedoLogs]),
);
