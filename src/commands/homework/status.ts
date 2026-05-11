import { Effect, Option } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../services/educoder-api/index.js";
import { HomeworkId, SecKey, TaskId } from "./flags.js";
import { fetchTaskInfo, makeStatusRequest, parseTaskContext, printStatusResponse, resolveLogin } from "./shared.js";

export const statusCommand = Command.make(
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
  Effect.fn("homework.status")(function* (input) {
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin();
    const taskInfo = yield* fetchTaskInfo({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      login,
    });
    const context = yield* parseTaskContext(taskInfo, Option.none(), 1);
    const response = yield* educoder.Task.gameStatus(
      makeStatusRequest({
        taskId: input.taskId,
        homeworkId: input.homeworkId,
        login,
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
      command: "open-educoder homework status sflmr2fxi4wn --homework-id 3487324 --sec-key ypzno7qmxwjt",
      description: "Check an evaluation status key",
    },
    {
      command: "open-educoder homework status sflmr2fxi4wn --homework-id 3487324 --sec-key ypzno7qmxwjt --json",
      description: "Print the raw status response as JSON",
    },
  ]),
  Command.withAlias("s"),
);
