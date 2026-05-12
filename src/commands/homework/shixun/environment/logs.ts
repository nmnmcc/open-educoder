import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { EnvironmentId, HomeworkId, TabType, TaskId } from "../../flags.js";
import { inspectOptions, optionToUndefined, printJson } from "../../shared.js";

export const Logs = Command.make(
  "logs",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    envId: EnvironmentId,
    tabType: TabType,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.logs")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.getLogs({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      envId: optionToUndefined(input.envId),
      tabType: input.tabType,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Fetch terminal or build logs for a shixun environment."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun logs sflmr2fxi4wn --homework-id 3487324 --env-id 1128633",
      description: "Read latest logs for an environment",
    },
  ]),
  Command.withAlias("o"),
);
