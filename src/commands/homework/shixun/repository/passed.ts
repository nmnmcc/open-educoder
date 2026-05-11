import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { RepositoryPath, TaskId } from "../../flags.js";
import { printJson } from "../../shared.js";

export const Passed = Command.make(
  "passed",
  {
    taskId: TaskId,
    path: RepositoryPath,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.passed")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.getPassedCode({
      taskId: input.taskId,
      path: input.path,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(result.raw.content);
  }),
).pipe(
  Command.withDescription("Fetch the last passed code for a shixun homework file."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun passed sflmr2fxi4wn case1/code.sh",
      description: "Print passed code for a task file",
    },
  ]),
  Command.withAlias("a"),
);
