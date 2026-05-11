import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../../../services/educoder-api/index.js";
import { EnvironmentId, HomeworkId, TaskId } from "../../flags.js";
import { inspectOptions, printJson, resolveHomeworkContext } from "../../shared.js";

export const Commit = Command.make(
  "commit",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    envId: EnvironmentId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.commit")(function* (input) {
    const educoder = yield* EducoderApi;
    const { user, context } = yield* resolveHomeworkContext({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      envId: input.envId,
      tabType: 1,
    });
    const response = yield* educoder.Task.commitFiles({
      params: {
        taskId: input.taskId,
      },
      query: {
        shixun_environment_id: context.environmentId,
        zzud: user.login,
      },
    });

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(
      {
        commit: response,
      },
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("Commit repository files for a shixun homework environment."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun commit sflmr2fxi4wn --homework-id 3487324 --env-id 1128633",
      description: "Commit files for the specified environment",
    },
  ]),
  Command.withAlias("C"),
);
