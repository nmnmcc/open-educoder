import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../services/educoder-api/index.js";
import { HomeworkId, RepositoryPath, TaskId } from "./flags.js";
import { decodeBase64, printJson, resolveLogin } from "./shared.js";

export const contentCommand = Command.make(
  "content",
  {
    taskId: TaskId,
    path: RepositoryPath,
    homeworkId: HomeworkId,
    exerciseId: Flag.string("exercise-id").pipe(Flag.withDefault("")),
    raw: Flag.boolean("raw"),
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.content")(function* (input) {
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin();
    const response = yield* educoder.Task.repContent({
      params: {
        taskId: input.taskId,
      },
      query: {
        path: input.path,
        homework_common_id: input.homeworkId,
        exercise_id: input.exerciseId,
        zzud: login,
      },
    });
    const decodedContent = decodeBase64(response.content.content);

    if (input.json) {
      return yield* printJson({
        ...response,
        decodedContent,
      });
    }

    yield* Console.log(input.raw ? response.content.content : decodedContent);
  }),
).pipe(
  Command.withDescription("Fetch a repository file from a shixun task and decode its base64 content."),
  Command.withExamples([
    {
      command: "open-educoder homework content sflmr2fxi4wn case1/code.sh --homework-id 3487324",
      description: "Read and decode a task file",
    },
    {
      command: "open-educoder homework content sflmr2fxi4wn case1/code.sh --homework-id 3487324 --raw",
      description: "Print the raw base64 payload",
    },
  ]),
  Command.withAlias("c"),
);
