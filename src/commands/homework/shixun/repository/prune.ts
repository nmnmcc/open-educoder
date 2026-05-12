import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { ChallengeId, ChallengeIndex, CourseId, HomeworkIdArgument } from "../../flags.js";
import { renderGeneric } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Prune = Command.make(
  "prune",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.prune")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.pruneRepository({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("清理结果 / Prune Result", result.view));
  }),
).pipe(
  Command.withDescription("Trigger cleanup of expired repository snapshots for this task."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun prune 109348 3487324",
      description: "Clean up expired repository snapshots",
    },
  ]),
  Command.withAlias("V"),
);
