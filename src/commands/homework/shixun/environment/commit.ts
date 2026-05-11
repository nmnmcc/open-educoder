import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { EnvironmentId, HomeworkId, TaskId } from "../../flags.js";
import { inspectOptions, optionToUndefined, printJson } from "../../shared.js";

export const Commit = Command.make(
  "commit",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    envId: EnvironmentId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.commit")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.commitFiles({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      envId: optionToUndefined(input.envId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Commit repository files for a shixun homework environment."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun commit sflmr2fxi4wn --homework-id 3487324 --env-id 1128633",
      description: "Commit files for the specified environment",
    },
  ]),
  Command.withAlias("C"),
);
