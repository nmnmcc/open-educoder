import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { AssignmentIdArgument, ChallengeId, ChallengeIndex, CourseId } from "../../flags.js";
import { renderGeneric } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Reset = Command.make(
  "reset",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw reset response as JSON.")),
  },
  Effect.fn("assignments.labs.reset")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.resetRepository({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("重置结果 / Reset Result", result.view));
  }),
).pipe(
  Command.withDescription("Reset the lab task repository to its initial state, discarding saved edits."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs reset 109348 3487324",
      description: "Discard local edits and reset task repository",
    },
  ]),
  Command.withAlias("R"),
);
