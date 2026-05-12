import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import {
  AssignmentIdArgument,
  Content,
  ContentFile,
  CourseId,
  EnvironmentId,
  RepositoryPath,
  RequiredChallengeId,
  RequiredChallengeIndex,
  TabType,
} from "../../flags.js";
import { renderGeneric } from "../../render.js";
import { optionToUndefined, printJson, readContent, requireChallengeSelector } from "../../shared.js";

export const Save = Command.make(
  "save",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    path: RepositoryPath,
    challengeIndex: RequiredChallengeIndex,
    challengeId: RequiredChallengeId,
    content: Content,
    file: ContentFile,
    evaluate: Flag.boolean("evaluate").pipe(Flag.withDescription("Start evaluation after saving the file.")),
    envId: EnvironmentId,
    tabType: TabType,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw save response as JSON.")),
  },
  Effect.fn("assignments.labs.save")(function* (input) {
    yield* requireChallengeSelector({
      challengeIndex: input.challengeIndex,
      challengeId: input.challengeId,
    });
    const content = yield* readContent({
      content: input.content,
      file: input.file,
    });
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.saveRepositoryFile({
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
  Command.withDescription("Save inline or local file content to a lab repository path."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs save 109348 3487324 case1/code.sh --file ./code.sh",
      description: "Upload local file content to a repository path",
    },
    {
      command: 'open-educoder assignments labs save 109348 3487324 case1/code.sh --content "touch file1"',
      description: "Upload inline content directly",
    },
  ]),
  Command.withAlias("S"),
);
