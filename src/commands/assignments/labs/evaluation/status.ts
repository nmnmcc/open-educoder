import { Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { ChallengeId, ChallengeIndex, CourseId, AssignmentIdArgument, SecKey } from "../../flags.js";
import { optionToUndefined, printStatusResponse } from "../../shared.js";

export const Status = Command.make(
  "status",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    secKey: SecKey,
    resubmit: Flag.string("resubmit").pipe(Flag.withDefault("")),
    timeOut: Flag.boolean("time-out"),
    port: Flag.integer("port").pipe(Flag.withDefault(0)),
    subjectId: Flag.string("subject-id").pipe(Flag.withDefault("")),
    json: Flag.boolean("json"),
  },
  Effect.fn("assignments.labs.status")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.getEvaluationStatus({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
      secKey: input.secKey,
      resubmit: input.resubmit,
      timeOut: input.timeOut,
      port: input.port,
      subjectId: input.subjectId,
    });

    yield* printStatusResponse(result.raw, input.json);
  }),
).pipe(
  Command.withDescription("Check evaluation status for a lab task run."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs status 109348 3487324 --sec-key ypzno7qmxwjt",
      description: "Check run status with a sec-key",
    },
    {
      command: "open-educoder assignments labs status 109348 3487324 --sec-key ypzno7qmxwjt --json",
      description: "Print evaluation status as JSON",
    },
  ]),
  Command.withAlias("s"),
);
