import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { ChallengeId, ChallengeIndex, CourseId, HomeworkIdArgument, RepositoryPath } from "../../flags.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Content = Command.make(
  "content",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    path: RepositoryPath,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    exerciseId: Flag.string("exercise-id").pipe(Flag.withDefault("")),
    raw: Flag.boolean("raw"),
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.content")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.getRepositoryContent({
      courseId: input.courseId,
      path: input.path,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
      exerciseId: input.exerciseId,
    });

    if (input.json) {
      return yield* printJson(result.view);
    }

    yield* Console.log(input.raw ? result.raw.content.content : result.view.decodedContent);
  }),
).pipe(
  Command.withDescription("Read a repository file and decode base64 content for display."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun content 109348 3487324 case1/code.sh",
      description: "Read a task file as text",
    },
    {
      command: "open-educoder homework shixun content 109348 3487324 case1/code.sh --raw",
      description: "Print raw base64 payload without decoding",
    },
  ]),
  Command.withAlias("c"),
);
