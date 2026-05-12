import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { HomeworkId, TaskId } from "../../flags.js";
import { inspectOptions, printJson } from "../../shared.js";

export const Task = Command.make(
  "task",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.task")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.getTask({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Fetch task context for a shixun homework game."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun task sflmr2fxi4wn --homework-id 3487324",
      description: "Inspect task details by task and homework ID",
    },
    {
      command: "open-educoder homework shixun task sflmr2fxi4wn --homework-id 3487324 --json",
      description: "Print the raw task response as JSON",
    },
  ]),
  Command.withAlias("t"),
);
