import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../../services/educoder-api/index.js";
import { RepositoryPath, TaskId } from "../flags.js";
import { printJson, resolveLogin } from "../shared.js";

export const passedCodeCommand = Command.make(
  "passed-code",
  {
    taskId: TaskId,
    path: RepositoryPath,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.passedCode")(function* (input) {
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin();
    const response = yield* educoder.Task.resetPassedCode({
      params: {
        taskId: input.taskId,
      },
      query: {
        path: input.path,
        zzud: login,
      },
    });

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.log(response.content);
  }),
).pipe(
  Command.withDescription("Fetch the last passed code for a shixun homework file."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun passed-code sflmr2fxi4wn case1/code.sh",
      description: "Print passed code for a task file",
    },
  ]),
  Command.withAlias("a"),
);
