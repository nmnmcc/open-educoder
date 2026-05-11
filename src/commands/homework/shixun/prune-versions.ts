import { Console, Effect, Option } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../../services/educoder-api/index.js";
import { HomeworkId, TaskId } from "../flags.js";
import { inspectOptions, printJson, resolveHomeworkContext } from "../shared.js";

export const pruneVersionsCommand = Command.make(
  "prune-versions",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.pruneVersions")(function* (input) {
    const educoder = yield* EducoderApi;
    const { user, context } = yield* resolveHomeworkContext({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      envId: Option.none(),
      tabType: 1,
    });
    const response = yield* educoder.Myshixun.versionRepositoryDelete({
      params: {
        myshixunId: String(context.myshixunId),
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
        pruneVersions: response,
      },
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("Delete expired repository versions for a shixun homework when Educoder marks them expired."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun prune-versions sflmr2fxi4wn --homework-id 3487324",
      description: "Run Educoder's expired repository version cleanup",
    },
  ]),
  Command.withAlias("V"),
);
