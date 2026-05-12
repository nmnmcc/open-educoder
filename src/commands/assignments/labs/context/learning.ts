import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { AssignmentIdArgument, ChallengeId, ChallengeIndex, CourseId } from "../../flags.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Learning = Command.make(
  "learning",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    markdown: Flag.boolean("markdown").pipe(Flag.withDescription("Print the original Markdown content.")),
    text: Flag.boolean("text").pipe(Flag.withDescription("Print plain text instead of ANSI-rendered content.")),
    json: Flag.boolean("json").pipe(Flag.withDescription("Print rendered learning content as JSON.")),
  },
  Effect.fn("assignments.labs.learning")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.getLearningContent({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
    });

    if (input.json) {
      return yield* printJson(result.view);
    }

    yield* Console.log(
      input.markdown ? result.view.content.markdown : input.text ? result.view.content.text : result.view.content.ansi,
    );
  }),
).pipe(
  Command.withDescription("Show the learning/task description content for one lab challenge."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs learning 109348 3487324 --challenge-index 5",
      description: "Render the fifth challenge's learning content for the terminal",
    },
    {
      command: "open-educoder assignments labs learning 109348 3487324 --challenge-index 5 --text",
      description: "Show the fifth challenge's learning content as plain text",
    },
    {
      command: "open-educoder assignments labs learning 109348 3487324 --challenge-index 5 --markdown",
      description: "Show the original Markdown learning content",
    },
  ]),
  Command.withAlias("g"),
);
