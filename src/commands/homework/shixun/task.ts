import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { HomeworkId, TaskId } from "../flags.js";
import { fetchTaskInfo, formatTaskInfo, inspectOptions, printJson, resolveLogin } from "../shared.js";

export const Task = Command.make(
  "task",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.task")(function* (input) {
    const login = yield* resolveLogin();
    const response = yield* fetchTaskInfo({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      login,
    });

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(formatTaskInfo(response), inspectOptions);
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
