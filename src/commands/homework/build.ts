import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../services/educoder-api/index.js";
import { CommitId, EnvironmentId, HomeworkId, SecKey, TabType, TaskId } from "./flags.js";
import {
  fetchTaskInfo,
  inspectOptions,
  makeGameBuildPayload,
  parseTaskContext,
  printJson,
  resolveCurrentUser,
} from "./shared.js";

export const buildCommand = Command.make(
  "build",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    secKey: SecKey,
    commitId: CommitId,
    contentModified: Flag.integer("content-modified").pipe(Flag.withDefault(0)),
    resubmit: Flag.string("resubmit").pipe(Flag.withDefault("")),
    envId: EnvironmentId,
    tabType: TabType,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.build")(function* (input) {
    const educoder = yield* EducoderApi;
    const user = yield* resolveCurrentUser();
    const taskInfo = yield* fetchTaskInfo({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      login: user.login,
    });
    const context = yield* parseTaskContext(taskInfo, input.envId, input.tabType);
    const response = yield* educoder.Task.gameBuild({
      params: {
        taskId: input.taskId,
      },
      query: {
        zzud: user.login,
      },
      payload: makeGameBuildPayload({
        homeworkId: input.homeworkId,
        secKey: input.secKey,
        resubmit: input.resubmit,
        commitId: input.commitId,
        contentModified: input.contentModified,
        context,
        user,
        tabType: input.tabType,
      }),
    });

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(
      {
        build: response,
      },
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("Trigger Educoder game_build for a saved shixun homework file."),
  Command.withExamples([
    {
      command:
        "open-educoder homework build sflmr2fxi4wn --homework-id 3487324 --sec-key ypzno7qmxwjt --commit-id 6a4abf53145fe87c261681074a51a4374fbba65a",
      description: "Trigger evaluation with a sec_key and commit ID",
    },
  ]),
  Command.withAlias("B"),
);
