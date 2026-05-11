import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../services/educoder-api/index.js";
import { EnvironmentId, HomeworkId, TaskId } from "./flags.js";
import { fetchTaskInfo, inspectOptions, parseTaskContext, printJson, resolveLogin } from "./shared.js";

export const pullFilesCommand = Command.make(
  "pull-files",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    envId: EnvironmentId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.pullFiles")(function* (input) {
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin();
    const taskInfo = yield* fetchTaskInfo({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      login,
    });
    const context = yield* parseTaskContext(taskInfo, input.envId, 1);
    const response = yield* educoder.Task.pullFiles({
      params: {
        taskId: input.taskId,
      },
      query: {
        shixun_environment_id: context.environmentId,
        zzud: login,
      },
    });

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(
      {
        pullFiles: response,
      },
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("Pull repository files from Educoder for a shixun homework environment."),
  Command.withExamples([
    {
      command: "open-educoder homework pull-files sflmr2fxi4wn --homework-id 3487324 --env-id 1128633",
      description: "Pull files for the specified environment",
    },
  ]),
  Command.withAlias("P"),
);
