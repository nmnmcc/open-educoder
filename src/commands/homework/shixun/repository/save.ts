import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { Content, ContentFile, EnvironmentId, HomeworkId, RepositoryPath, TabType, TaskId } from "../../flags.js";
import {
  formatSaveResponse,
  inspectOptions,
  printJson,
  readContent,
  resolveHomeworkContext,
  saveRepositoryFile,
} from "../../shared.js";

export const Save = Command.make(
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
  Effect.fn("homework.shixun.save")(function* (input) {
    const { user, context } = yield* resolveHomeworkContext({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      envId: input.envId,
      tabType: input.tabType,
    });
    const content = yield* readContent({
      content: input.content,
      file: input.file,
    });
    const response = yield* saveRepositoryFile({
      homeworkId: input.homeworkId,
      path: input.path,
      content,
      evaluate: input.evaluate,
      context,
      user,
      tabType: input.tabType,
    });

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(
      {
        saved: formatSaveResponse(input.path, response),
      },
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("Save local content into an Educoder shixun repository file."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun save sflmr2fxi4wn case1/code.sh --homework-id 3487324 --file ./code.sh",
      description: "Upload a local file to a task path",
    },
    {
      command:
        'open-educoder homework shixun save sflmr2fxi4wn case1/code.sh --homework-id 3487324 --content "touch file1"',
      description: "Save inline content without reading a local file",
    },
  ]),
  Command.withAlias("S"),
);
