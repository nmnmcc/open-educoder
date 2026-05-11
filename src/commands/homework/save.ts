import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../services/educoder-api/index.js";
import { Content, ContentFile, EnvironmentId, HomeworkId, RepositoryPath, TabType, TaskId } from "./flags.js";
import {
  fetchTaskInfo,
  inspectOptions,
  makeUpdateFilePayload,
  parseTaskContext,
  printJson,
  readContent,
  resolveCurrentUser,
} from "./shared.js";

export const saveCommand = Command.make(
  "save",
  {
    taskId: TaskId,
    path: RepositoryPath,
    homeworkId: HomeworkId,
    content: Content,
    file: ContentFile,
    evaluate: Flag.boolean("evaluate"),
    envId: EnvironmentId,
    tabType: TabType,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.save")(function* (input) {
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
    const response = yield* educoder.Myshixun.updateFile({
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
        evaluate: input.evaluate,
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
        saved: {
          path: input.path,
          commitId: response.content.commitID,
          secKey: response.sec_key,
          resubmit: response.resubmit,
          contentModified: response.content_modified,
          size: response.content.size,
        },
      },
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("Save local content into an Educoder shixun repository file."),
  Command.withExamples([
    {
      command: "open-educoder homework save sflmr2fxi4wn case1/code.sh --homework-id 3487324 --file ./code.sh",
      description: "Upload a local file to a task path",
    },
    {
      command: 'open-educoder homework save sflmr2fxi4wn case1/code.sh --homework-id 3487324 --content "touch file1"',
      description: "Save inline content without reading a local file",
    },
  ]),
  Command.withAlias("S"),
);
