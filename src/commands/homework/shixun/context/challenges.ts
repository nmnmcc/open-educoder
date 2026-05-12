import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { CourseId, HomeworkIdArgument } from "../../flags.js";
import { renderChallenges } from "../../render.js";
import { printJson } from "../../shared.js";

export const Challenges = Command.make(
  "challenges",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.challenges")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.listChallenges({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderChallenges(result.view));
  }),
).pipe(
  Command.withDescription("List shixun challenges with challenge-index and challenge-id labels."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun challenges 109348 3487324",
      description: "List challenge IDs and indexes for one shixun homework",
    },
  ]),
  Command.withAlias("k"),
);
