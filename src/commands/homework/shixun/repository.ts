import { Console, Effect, Option } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../../services/educoder-api/index.js";
import { HomeworkId, TaskId } from "../flags.js";
import { inspectOptions, printJson, resolveHomeworkContext } from "../shared.js";

export const repositoryCommand = Command.make(
  "repository",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    path: Flag.string("path").pipe(Flag.optional),
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.repository")(function* (input) {
    const educoder = yield* EducoderApi;
    const { user, context } = yield* resolveHomeworkContext({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      envId: Option.none(),
      tabType: 1,
    });
    const path = Option.isSome(input.path) ? input.path.value : "";
    const response = yield* educoder.Myshixun.repository({
      params: {
        myshixunId: context.myshixunIdentifier,
      },
      query: {
        zzud: user.login,
      },
      payload: path.length >= 1 ? { path } : {},
    });

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(
      {
        repository: {
          path: path.length >= 1 ? path : ".",
          entries: Object.fromEntries(
            response.trees.map((entry) => [
              entry.name,
              {
                type: entry.type,
                path: path.length >= 1 ? `${path}/${entry.name}` : entry.name,
              },
            ]),
          ),
        },
      },
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("List files and directories in a shixun homework repository."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun repository sflmr2fxi4wn --homework-id 3487324",
      description: "List repository entries at the root",
    },
    {
      command: "open-educoder homework shixun repository sflmr2fxi4wn --homework-id 3487324 --path case1",
      description: "List entries under a repository path",
    },
  ]),
  Command.withAlias("f"),
);
