import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { ChallengeId, ChallengeIndex, CourseId, EnvironmentId, AssignmentIdArgument, TabType } from "../../flags.js";
import { renderGeneric } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Logs = Command.make(
  "logs",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    envId: EnvironmentId,
    tabType: TabType,
    json: Flag.boolean("json"),
  },
  Effect.fn("assignments.labs.logs")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.getLogs({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
      envId: optionToUndefined(input.envId),
      tabType: input.tabType,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("日志 / Logs", result.view));
  }),
).pipe(
  Command.withDescription("Fetch terminal or build logs for a lab environment."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs logs 109348 3487324 --env-id 1128633",
      description: "Read latest logs for an environment",
    },
  ]),
  Command.withAlias("o"),
);
