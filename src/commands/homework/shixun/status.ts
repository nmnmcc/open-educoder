import { Effect, Option } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../../services/educoder-api/index.js";
import { HomeworkId, SecKey, TaskId } from "../flags.js";
import { makeStatusRequest, printStatusResponse, resolveHomeworkContext } from "../shared.js";

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
    const educoder = yield* EducoderApi;
    const { user, context } = yield* resolveHomeworkContext({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      envId: Option.none(),
      tabType: 1,
    });
    const response = yield* educoder.Task.gameStatus(
      makeStatusRequest({
        taskId: input.taskId,
        homeworkId: input.homeworkId,
        login: user.login,
        secKey: input.secKey,
        challengeId: context.challengeId,
        resubmit: input.resubmit,
        timeOut: input.timeOut,
        port: input.port,
        subjectId: input.subjectId,
      }),
    );

    yield* printStatusResponse(response, input.json);
  }),
).pipe(
  Command.withDescription("Read evaluation status for a shixun homework build."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun status sflmr2fxi4wn --homework-id 3487324 --sec-key ypzno7qmxwjt",
      description: "Check an evaluation status key",
    },
    {
      command: "open-educoder homework shixun status sflmr2fxi4wn --homework-id 3487324 --sec-key ypzno7qmxwjt --json",
      description: "Print the raw status response as JSON",
    },
  ]),
  Command.withAlias("s"),
);
