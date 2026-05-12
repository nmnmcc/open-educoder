import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { ChallengeId, ChallengeIndex, CourseId, HomeworkIdArgument, RepositoryPath } from "../../flags.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Passed = Command.make(
  "passed",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    path: RepositoryPath,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.passed")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.getPassedCode({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      path: input.path,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(result.raw.content);
  }),
).pipe(
  Command.withDescription("Fetch the last accepted code version for a shixun file."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun passed 109348 3487324 case1/code.sh",
      description: "Show latest passed code for one file",
    },
  ]),
  Command.withAlias("a"),
);
