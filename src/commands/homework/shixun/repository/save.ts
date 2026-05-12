import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import {
  ChallengeId,
  ChallengeIndex,
  Content,
  ContentFile,
  CourseId,
  EnvironmentId,
  HomeworkIdArgument,
  RepositoryPath,
  TabType,
} from "../../flags.js";
import { renderGeneric } from "../../render.js";
import { optionToUndefined, printJson, readContent } from "../../shared.js";

export const Save = Command.make(
  "save",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    path: RepositoryPath,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
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
      courseId: input.courseId,
      path: input.path,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
      content,
      evaluate: input.evaluate,
      envId: optionToUndefined(input.envId),
      tabType: input.tabType,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("保存结果 / Save Result", result.view));
  }),
).pipe(
  Command.withDescription("Upload content to a shixun repository file (inline or from file)."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun save 109348 3487324 case1/code.sh --file ./code.sh",
      description: "Upload local file content to a repository path",
    },
    {
      command: 'open-educoder homework shixun save 109348 3487324 case1/code.sh --content "touch file1"',
      description: "Upload inline content directly",
    },
  ]),
  Command.withAlias("S"),
);
