import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { HomeworkId, RepositoryPath, TaskId } from "../../flags.js";
import { printJson } from "../../shared.js";

export const Content = Command.make(
  "content",
  {
    taskId: TaskId,
    path: RepositoryPath,
    homeworkId: HomeworkId,
    exerciseId: Flag.string("exercise-id").pipe(Flag.withDefault("")),
    raw: Flag.boolean("raw"),
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.content")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.getRepositoryContent({
      taskId: input.taskId,
      path: input.path,
      homeworkId: input.homeworkId,
      exerciseId: input.exerciseId,
    });

    if (input.json) {
      return yield* printJson(result.view);
    }

    yield* Console.log(input.raw ? result.raw.content.content : result.view.decodedContent);
  }),
).pipe(
  Command.withDescription("Fetch a repository file from a shixun task and decode its base64 content."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun content sflmr2fxi4wn case1/code.sh --homework-id 3487324",
      description: "Read and decode a task file",
    },
    {
      command: "open-educoder homework shixun content sflmr2fxi4wn case1/code.sh --homework-id 3487324 --raw",
      description: "Print the raw base64 payload",
    },
  ]),
  Command.withAlias("c"),
);
