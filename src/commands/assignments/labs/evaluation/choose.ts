import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { AssignmentIdArgument, ChallengeId, ChallengeIndex, CourseId } from "../../flags.js";
import { renderChoiceSubmit } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

const Answer = Flag.string("answer").pipe(
  Flag.withDescription(
    "Answer in question order. Repeat once per question; use a JSON string array for multi-blank answers.",
  ),
  Flag.atLeast(1),
);

const OptionalQuestionId = Flag.string("question-id").pipe(
  Flag.withDescription("Optional Educoder question ID for passthrough submissions."),
  Flag.optional,
);

const OptionalCompetitionEntryId = Flag.string("competition-entry-id").pipe(
  Flag.withDescription("Optional Educoder competition entry ID for passthrough submissions."),
  Flag.optional,
);

export const Choose = Command.make(
  "choose",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    answer: Answer,
    subjectId: Flag.string("subject-id").pipe(
      Flag.withDescription("Optional Educoder subject ID for passthrough submissions."),
      Flag.withDefault(""),
    ),
    questionId: OptionalQuestionId,
    competitionEntryId: OptionalCompetitionEntryId,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw objective-question submit response as JSON.")),
  },
  Effect.fn("assignments.labs.choose")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.submitChoices({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
      answers: input.answer,
      subjectId: input.subjectId,
      questionId: optionToUndefined(input.questionId),
      competitionEntryId: optionToUndefined(input.competitionEntryId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderChoiceSubmit(result.view));
  }),
).pipe(
  Command.withDescription("Submit objective-question answers for one lab challenge."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs choose 109348 421759 --answer '[\"blank\"]' --answer true --answer C",
      description: "Submit answers in the same order shown by the choices command",
    },
  ]),
  Command.withAlias("A"),
);
