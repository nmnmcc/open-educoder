import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { EnvironmentId, HomeworkId, TaskId } from "../../flags.js";
import { inspectOptions, optionToUndefined, printJson } from "../../shared.js";

export const Pull = Command.make(
  "pull",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    envId: EnvironmentId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.pull")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.pullFiles({
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
  Command.withDescription("Pull repository files from Educoder for a shixun homework environment."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun pull sflmr2fxi4wn --homework-id 3487324 --env-id 1128633",
      description: "Pull files for the specified environment",
    },
  ]),
  Command.withAlias("P"),
);
