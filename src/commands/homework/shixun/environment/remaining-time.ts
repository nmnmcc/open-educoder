import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { HomeworkId, TaskId } from "../../flags.js";
import { inspectOptions, printJson } from "../../shared.js";

export const RemainingTime = Command.make(
  "remaining-time",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.remainingTime")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.getRemainingTime({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Check remaining container/runtime time for a shixun task."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun remaining-time sflmr2fxi4wn --homework-id 3487324",
      description: "Check how long the running environment is still available",
    },
  ]),
  Command.withAlias("m"),
);
