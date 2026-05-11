import { Console, Effect, Option } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../../../services/educoder-api/index.js";
import { HomeworkId, TaskId } from "../../flags.js";
import { inspectOptions, printJson, resolveHomeworkContext } from "../../shared.js";

export const RemainingTime = Command.make(
  "remaining-time",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.remainingTime")(function* (input) {
    const educoder = yield* EducoderApi;
    const { user, context } = yield* resolveHomeworkContext({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      envId: Option.none(),
      tabType: 1,
    });
    const response = yield* educoder.Myshixun.getRemainingTime({
      params: {
        myshixunId: context.myshixunIdentifier,
      },
      query: {
        zzud: user.login,
      },
    });

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(
      {
        remainingTime: response,
      },
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("Fetch remaining environment time for a shixun homework."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun remaining-time sflmr2fxi4wn --homework-id 3487324",
      description: "Read remaining time for the task environment",
    },
  ]),
  Command.withAlias("m"),
);
