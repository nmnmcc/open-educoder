import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { CommitId, EnvironmentId, HomeworkId, SecKey, TabType, TaskId } from "../../flags.js";
import { inspectOptions, optionToUndefined, printJson } from "../../shared.js";

export const Build = Command.make(
  "build",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    secKey: SecKey,
    commitId: CommitId,
    contentModified: Flag.integer("content-modified").pipe(Flag.withDefault(0)),
    resubmit: Flag.string("resubmit").pipe(Flag.withDefault("")),
    envId: EnvironmentId,
    tabType: TabType,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.build")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.buildRepositoryFile({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      secKey: input.secKey,
      resubmit: input.resubmit,
      commitId: input.commitId,
      contentModified: input.contentModified,
      envId: optionToUndefined(input.envId),
      tabType: input.tabType,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Trigger a build/run action for an already saved repository snapshot."),
  Command.withExamples([
    {
      command:
        "open-educoder homework shixun build sflmr2fxi4wn --homework-id 3487324 --sec-key ypzno7qmxwjt --commit-id 6a4abf53145fe87c261681074a51a4374fbba65a",
      description: "Trigger evaluation by sec key and commit id",
    },
  ]),
  Command.withAlias("B"),
);
