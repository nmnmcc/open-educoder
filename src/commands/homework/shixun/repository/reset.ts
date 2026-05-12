import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { ChallengeId, ChallengeIndex, CourseId, HomeworkIdArgument } from "../../flags.js";
import { renderGeneric } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Reset = Command.make(
  "reset",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.reset")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.resetRepository({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("重置结果 / Reset Result", result.view));
  }),
).pipe(
  Command.withDescription("Reset the shixun repository for this task to its initial state."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun reset 109348 3487324",
      description: "Discard local edits and reset task repository",
    },
  ]),
  Command.withAlias("R"),
);
