import { Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { AssignmentIdArgument, ChallengeId, ChallengeIndex, CourseId, SecKey } from "../../flags.js";
import { optionToUndefined, printStatusResponse } from "../../shared.js";

export const Status = Command.make(
  "status",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    secKey: SecKey,
    resubmit: Flag.string("resubmit").pipe(
      Flag.withDescription("Optional Educoder resubmit token."),
      Flag.withDefault(""),
    ),
    timeOut: Flag.boolean("time-out").pipe(Flag.withDescription("Request timeout status from Educoder.")),
    port: Flag.integer("port").pipe(
      Flag.withDescription("Runtime port used by some status checks."),
      Flag.withDefault(0),
    ),
    subjectId: Flag.string("subject-id").pipe(
      Flag.withDescription("Optional Educoder subject ID for status checks."),
      Flag.withDefault(""),
    ),
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw evaluation status as JSON.")),
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
  Command.withDescription("Check the current evaluation/build status for a lab task run."),
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
