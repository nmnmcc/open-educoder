import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { Content, ContentFile, EnvironmentId, HomeworkId, RepositoryPath, TabType, TaskId } from "../../flags.js";
import { inspectOptions, optionToUndefined, printJson, readContent } from "../../shared.js";

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
    const content = yield* readContent({
      content: input.content,
      file: input.file,
    });
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.saveRepositoryFile({
      taskId: input.taskId,
      path: input.path,
      homeworkId: input.homeworkId,
      content,
      evaluate: input.evaluate,
      envId: optionToUndefined(input.envId),
      tabType: input.tabType,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
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
