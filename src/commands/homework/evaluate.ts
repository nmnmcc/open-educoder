import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../services/educoder-api/index.js";
import {
  Content,
  ContentFile,
  EnvironmentId,
  HomeworkId,
  PositiveInteger,
  RepositoryPath,
  TabType,
  TaskId,
} from "./flags.js";
import {
  failInput,
  fetchTaskInfo,
  inspectOptions,
  makeGameBuildPayload,
  makeUpdateFilePayload,
  parseTaskContext,
  pollGameStatus,
  printJson,
  printStatusResponse,
  readContent,
  resolveCurrentUser,
} from "./shared.js";

export const evaluateCommand = Command.make(
  "evaluate",
  {
    taskId: TaskId,
    path: RepositoryPath,
    homeworkId: HomeworkId,
    content: Content,
    file: ContentFile,
    envId: EnvironmentId,
    tabType: TabType,
    poll: Flag.boolean("poll"),
    pollInterval: PositiveInteger("poll-interval").pipe(Flag.withDefault(2)),
    pollLimit: PositiveInteger("poll-limit").pipe(Flag.withDefault(20)),
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.evaluate")(function* (input) {
    const educoder = yield* EducoderApi;
    const user = yield* resolveCurrentUser();
    const taskInfo = yield* fetchTaskInfo({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      login: user.login,
    });
    const context = yield* parseTaskContext(taskInfo, input.envId, input.tabType);
    const content = yield* readContent({
      content: input.content,
      file: input.file,
    });
    const saveResponse = yield* educoder.Myshixun.updateFile({
      params: {
        myshixunId: context.myshixunIdentifier,
      },
      query: {
        zzud: user.login,
      },
      payload: makeUpdateFilePayload({
        homeworkId: input.homeworkId,
        path: input.path,
        content,
        evaluate: true,
        context,
        user,
        tabType: input.tabType,
      }),
    });
    const secKey = saveResponse.sec_key ?? "";

    if (secKey.length === 0) {
      return yield* failInput("Educoder did not return sec_key for this evaluation.");
    }

    const buildResponse = yield* educoder.Task.gameBuild({
      params: {
        taskId: input.taskId,
      },
      query: {
        zzud: user.login,
      },
      payload: makeGameBuildPayload({
        homeworkId: input.homeworkId,
        secKey,
        resubmit: saveResponse.resubmit ?? "",
        commitId: saveResponse.content.commitID,
        contentModified: saveResponse.content_modified,
        context,
        user,
        tabType: input.tabType,
      }),
    });
    const statusResponse = input.poll
      ? yield* pollGameStatus({
          taskId: input.taskId,
          homeworkId: input.homeworkId,
          login: user.login,
          secKey,
          challengeId: context.challengeId,
          resubmit: saveResponse.resubmit ?? "",
          timeOut: false,
          port: 0,
          subjectId: "",
          interval: input.pollInterval,
          limit: input.pollLimit,
          quiet: input.json,
        })
      : null;

    if (input.json) {
      return yield* printJson({
        save: saveResponse,
        build: buildResponse,
        status: statusResponse,
      });
    }

    if (statusResponse !== null) {
      return yield* printStatusResponse(statusResponse, false);
    }

    yield* Console.dir(
      {
        evaluate: {
          path: input.path,
          commitId: saveResponse.content.commitID,
          secKey,
          build: buildResponse,
        },
      },
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("Save a shixun homework file, trigger evaluation, and optionally poll until completion."),
  Command.withExamples([
    {
      command: "open-educoder homework evaluate sflmr2fxi4wn case1/code.sh --homework-id 3487324 --file ./code.sh",
      description: "Save and evaluate a task path",
    },
    {
      command:
        "open-educoder homework evaluate sflmr2fxi4wn case1/code.sh --homework-id 3487324 --file ./code.sh --poll --poll-interval 2 --poll-limit 20",
      description: "Save, evaluate, and poll until a result is available",
    },
  ]),
  Command.withAlias("E"),
);
