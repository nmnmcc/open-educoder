import { Command } from "effect/unstable/cli";

import { Comments, Draft, Info, Members, RedoLogs, Settings, Works } from "./commands.js";
import { List } from "./list.js";

export const Common = Command.make("common").pipe(
  Command.withDescription("Common homework actions: list tasks, view details, work status, and settings."),
  Command.withExamples([
    {
      command: "open-educoder homework common list 109348 --sort-by position --sort-direction desc",
      description: "List common assignments",
    },
    {
      command: "open-educoder homework common info 3487339",
      description: "Open assignment metadata and instructions",
    },
    {
      command: "open-educoder homework common works 109348 3487339",
      description: "Check member work status summary",
    },
    {
      command: "open-educoder homework common settings 109348 3487339",
      description: "View assignment settings and constraints",
    },
  ]),
  Command.withAlias("c"),
  Command.withSubcommands([List, Info, Works, Draft, Members, Comments, Settings, RedoLogs]),
);
