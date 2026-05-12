import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { HomeworkId, TaskId } from "../../flags.js";
import { inspectOptions, optionToUndefined, printJson } from "../../shared.js";

export const Repository = Command.make(
  "repository",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    path: Flag.string("path").pipe(Flag.optional),
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.repository")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.listRepository({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      path: optionToUndefined(input.path),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("List files and directories in a shixun repository path."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun repository sflmr2fxi4wn --homework-id 3487324",
      description: "Browse repository root entries",
    },
    {
      command: "open-educoder homework shixun repository sflmr2fxi4wn --homework-id 3487324 --path case1",
      description: "Browse a specific repository directory",
    },
  ]),
  Command.withAlias("f"),
);
