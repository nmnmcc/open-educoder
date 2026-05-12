import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { AssignmentIdArgument, ChallengeId, ChallengeIndex, CourseId } from "../../flags.js";
import { renderChoiceQuestions } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Choices = Command.make(
  "choices",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw objective-question task response as JSON.")),
  },
  Effect.fn("assignments.labs.choices")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.getChoices({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderChoiceQuestions(result.view));
  }),
).pipe(
  Command.withDescription("Show objective questions, options, and current answer state for one lab challenge."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs choices 109348 421759",
      description: "Inspect objective questions for one lab assignment",
    },
    {
      command: "open-educoder assignments labs choices 109348 421759 --challenge-index 1",
      description: "Inspect objective questions by challenge index",
    },
  ]),
  Command.withAlias("j"),
);
