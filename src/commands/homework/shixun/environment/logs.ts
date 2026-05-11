import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../../../services/educoder-api/index.js";
import { EnvironmentId, HomeworkId, TabType, TaskId } from "../../flags.js";
import { inspectOptions, printJson, resolveHomeworkContext } from "../../shared.js";

export const Logs = Command.make(
  "logs",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    envId: EnvironmentId,
    tabType: TabType,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.logs")(function* (input) {
    const educoder = yield* EducoderApi;
    const { user, context } = yield* resolveHomeworkContext({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      envId: input.envId,
      tabType: input.tabType,
    });
    const response = yield* educoder.Task.logOutput({
      params: {
        taskId: input.taskId,
      },
      query: {
        zzud: user.login,
      },
      payload: {
        shixun_environment_id: context.environmentId,
        tab_type: input.tabType,
        extras: {
          homework_common_id: input.homeworkId,
        },
      },
    });

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(
      {
        logs: response,
      },
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("Fetch terminal or evaluation log output for a shixun homework environment."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun logs sflmr2fxi4wn --homework-id 3487324 --env-id 1128633",
      description: "Fetch logs for the specified environment",
    },
  ]),
  Command.withAlias("o"),
);
