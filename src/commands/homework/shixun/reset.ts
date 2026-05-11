import { Console, Effect, Option } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../../services/educoder-api/index.js";
import { HomeworkId, TaskId } from "../flags.js";
import { inspectOptions, printJson, resolveHomeworkContext } from "../shared.js";

export const resetCommand = Command.make(
  "reset",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.reset")(function* (input) {
    const educoder = yield* EducoderApi;
    const { user, context } = yield* resolveHomeworkContext({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      envId: Option.none(),
      tabType: 1,
    });
    const response = yield* educoder.Myshixun.resetRepository({
      params: {
        myshixunId: context.myshixunIdentifier,
      },
      query: {
        zzud: user.login,
      },
      payload: {
        challenge_id: context.challengeId,
        homework_common_id: input.homeworkId,
      },
    });

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(
      {
        reset: response,
      },
      inspectOptions,
    );
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
