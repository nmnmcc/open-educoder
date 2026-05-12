import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { AssignmentIdArgument, ChallengeId, ChallengeIndex, CourseId, EnvironmentId } from "../../flags.js";
import { renderGeneric } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Commit = Command.make(
  "commit",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    envId: EnvironmentId,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw commit response as JSON.")),
  },
  Effect.fn("assignments.labs.commit")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.commitFiles({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
      envId: optionToUndefined(input.envId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("提交结果 / Commit Result", result.view));
  }),
).pipe(
  Command.withDescription("Create a repository commit from the current lab runtime files."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs commit 109348 3487324 --env-id 1128633",
      description: "Create a commit point for the selected environment",
    },
  ]),
  Command.withAlias("C"),
);
