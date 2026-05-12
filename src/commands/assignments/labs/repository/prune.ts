import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { AssignmentIdArgument, ChallengeId, ChallengeIndex, CourseId } from "../../flags.js";
import { renderGeneric } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Prune = Command.make(
  "prune",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw cleanup response as JSON.")),
  },
  Effect.fn("assignments.labs.prune")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.pruneRepository({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("清理结果 / Prune Result", result.view));
  }),
).pipe(
  Command.withDescription("Ask Educoder to clean up expired repository snapshots for this task."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs prune 109348 3487324",
      description: "Clean up expired repository snapshots",
    },
  ]),
  Command.withAlias("V"),
);
