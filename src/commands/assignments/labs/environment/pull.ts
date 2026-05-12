import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { ChallengeId, ChallengeIndex, CourseId, EnvironmentId, AssignmentIdArgument } from "../../flags.js";
import { renderGeneric } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Pull = Command.make(
  "pull",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    envId: EnvironmentId,
    json: Flag.boolean("json"),
  },
  Effect.fn("assignments.labs.pull")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.pullFiles({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
      envId: optionToUndefined(input.envId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("拉取结果 / Pull Result", result.view));
  }),
).pipe(
  Command.withDescription("Pull repository files from a selected lab environment to local runtime."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs pull 109348 3487324 --env-id 1128633",
      description: "Pull files from the selected environment",
    },
  ]),
  Command.withAlias("P"),
);
