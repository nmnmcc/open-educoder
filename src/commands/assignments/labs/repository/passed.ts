import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { ChallengeId, ChallengeIndex, CourseId, AssignmentIdArgument, RepositoryPath } from "../../flags.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Passed = Command.make(
  "passed",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    path: RepositoryPath,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    json: Flag.boolean("json"),
  },
  Effect.fn("assignments.labs.passed")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.getPassedCode({
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
  Command.withDescription("Fetch the last accepted code version for a lab file."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs passed 109348 3487324 case1/code.sh",
      description: "Show latest passed code for one file",
    },
  ]),
  Command.withAlias("a"),
);
