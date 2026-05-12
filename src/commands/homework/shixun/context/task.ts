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
  Command.withDescription("Get shixun task context and metadata for a specific task."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun task sflmr2fxi4wn --homework-id 3487324",
      description: "Open task details for one task and homework",
    },
    {
      command: "open-educoder homework shixun task sflmr2fxi4wn --homework-id 3487324 --json",
      description: "Print raw task details as JSON",
    },
  ]),
  Command.withAlias("t"),
);
