import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { ChallengeId, ChallengeIndex, CourseId, HomeworkIdArgument } from "../../flags.js";
import { renderRepository } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Repository = Command.make(
  "repository",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    path: Flag.string("path").pipe(Flag.optional),
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.repository")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.listRepository({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
      path: optionToUndefined(input.path),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderRepository(result.view));
  }),
).pipe(
  Command.withDescription("List files and directories in a shixun repository path."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun repository 109348 3487324",
      description: "Browse repository root entries",
    },
    {
      command: "open-educoder homework shixun repository 109348 3487324 --path case1",
      description: "Browse a specific repository directory",
    },
  ]),
  Command.withAlias("f"),
);
