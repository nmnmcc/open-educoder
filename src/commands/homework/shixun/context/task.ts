import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { ChallengeId, ChallengeIndex, CourseId, HomeworkIdArgument } from "../../flags.js";
import { renderShixunTask } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Task = Command.make(
  "task",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.task")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.getTask({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderShixunTask(result.view));
  }),
).pipe(
  Command.withDescription("Resolve and show shixun task context without manually finding task-id."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun task 109348 3487324",
      description: "Open the current shixun task for one homework",
    },
    {
      command: "open-educoder homework shixun task 109348 3487324 --challenge-index 1",
      description: "Open one challenge by visible index",
    },
  ]),
  Command.withAlias("t"),
);
