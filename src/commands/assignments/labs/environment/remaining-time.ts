import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { ChallengeId, ChallengeIndex, CourseId, AssignmentIdArgument } from "../../flags.js";
import { renderGeneric } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const RemainingTime = Command.make(
  "remaining-time",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    json: Flag.boolean("json"),
  },
  Effect.fn("assignments.labs.remainingTime")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.getRemainingTime({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("剩余时间 / Remaining Time", result.view));
  }),
).pipe(
  Command.withDescription("Check remaining container/runtime time for a lab task."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs remaining-time 109348 3487324",
      description: "Check how long the running environment is still available",
    },
  ]),
  Command.withAlias("m"),
);
