import { Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { ChallengeId, ChallengeIndex, CourseId, HomeworkIdArgument, SecKey } from "../../flags.js";
import { optionToUndefined, printStatusResponse } from "../../shared.js";

export const Status = Command.make(
  "status",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    secKey: SecKey,
    resubmit: Flag.string("resubmit").pipe(Flag.withDefault("")),
    timeOut: Flag.boolean("time-out"),
    port: Flag.integer("port").pipe(Flag.withDefault(0)),
    subjectId: Flag.string("subject-id").pipe(Flag.withDefault("")),
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.status")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.getEvaluationStatus({
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
  Command.withDescription("Check evaluation status for a shixun task run."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun status 109348 3487324 --sec-key ypzno7qmxwjt",
      description: "Check run status with a sec-key",
    },
    {
      command: "open-educoder homework shixun status 109348 3487324 --sec-key ypzno7qmxwjt --json",
      description: "Print evaluation status as JSON",
    },
  ]),
  Command.withAlias("s"),
);
