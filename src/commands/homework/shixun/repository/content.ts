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
  Command.withDescription("Read a repository file and decode base64 content for display."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun content sflmr2fxi4wn case1/code.sh --homework-id 3487324",
      description: "Read a task file as text",
    },
    {
      command: "open-educoder homework shixun content sflmr2fxi4wn case1/code.sh --homework-id 3487324 --raw",
      description: "Print raw base64 payload without decoding",
    },
  ]),
  Command.withAlias("c"),
);
