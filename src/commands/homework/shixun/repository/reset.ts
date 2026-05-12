import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { HomeworkId, TaskId } from "../../flags.js";
import { inspectOptions, printJson } from "../../shared.js";

export const Reset = Command.make(
  "reset",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.reset")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.resetRepository({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Reset the shixun homework repository for the current task."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun reset sflmr2fxi4wn --homework-id 3487324",
      description: "Reset the repository for a task",
    },
  ]),
  Command.withAlias("R"),
);
