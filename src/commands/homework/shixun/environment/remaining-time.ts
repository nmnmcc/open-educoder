import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { ChallengeId, ChallengeIndex, CourseId, HomeworkIdArgument } from "../../flags.js";
import { renderGeneric } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const RemainingTime = Command.make(
  "remaining-time",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.remainingTime")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.getRemainingTime({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("剩余时间 / Remaining Time", result.view));
  }),
).pipe(
  Command.withDescription("Check remaining container/runtime time for a shixun task."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun remaining-time 109348 3487324",
      description: "Check how long the running environment is still available",
    },
  ]),
  Command.withAlias("m"),
);
