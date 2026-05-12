import { Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { HomeworkId, SecKey, TaskId } from "../../flags.js";
import { printStatusResponse } from "../../shared.js";

export const Status = Command.make(
  "status",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
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
      taskId: input.taskId,
      homeworkId: input.homeworkId,
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
      command: "open-educoder homework shixun status sflmr2fxi4wn --homework-id 3487324 --sec-key ypzno7qmxwjt",
      description: "Check run status with a sec-key",
    },
    {
      command: "open-educoder homework shixun status sflmr2fxi4wn --homework-id 3487324 --sec-key ypzno7qmxwjt --json",
      description: "Print evaluation status as JSON",
    },
  ]),
  Command.withAlias("s"),
);
