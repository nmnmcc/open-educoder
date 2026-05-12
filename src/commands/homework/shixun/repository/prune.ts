import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { HomeworkId, TaskId } from "../../flags.js";
import { inspectOptions, printJson } from "../../shared.js";

export const Prune = Command.make(
  "prune",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.prune")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.pruneRepository({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Delete expired repository versions for a shixun homework when Educoder marks them expired."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun prune sflmr2fxi4wn --homework-id 3487324",
      description: "Run Educoder's expired repository version cleanup",
    },
  ]),
  Command.withAlias("V"),
);
