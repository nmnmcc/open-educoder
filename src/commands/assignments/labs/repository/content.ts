import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { AssignmentIdArgument, ChallengeId, ChallengeIndex, CourseId, RepositoryPath } from "../../flags.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Content = Command.make(
  "content",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    path: RepositoryPath,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    exerciseId: Flag.string("exercise-id").pipe(
      Flag.withDescription("Optional Educoder exercise identifier; usually leave empty."),
      Flag.withDefault(""),
    ),
    raw: Flag.boolean("raw").pipe(Flag.withDescription("Print raw base64 content without decoding.")),
    json: Flag.boolean("json").pipe(Flag.withDescription("Print decoded content and metadata as JSON.")),
  },
  Effect.fn("assignments.labs.content")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.getRepositoryContent({
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
  Command.withDescription("Read a lab repository file and print its decoded text content."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs content 109348 3487324 case1/code.sh",
      description: "Read a task file as text",
    },
    {
      command: "open-educoder assignments labs content 109348 3487324 case1/code.sh --raw",
      description: "Print raw base64 payload without decoding",
    },
  ]),
  Command.withAlias("c"),
);
