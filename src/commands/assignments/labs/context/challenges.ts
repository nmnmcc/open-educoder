import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { AssignmentIdArgument, CourseId } from "../../flags.js";
import { renderChallenges } from "../../render.js";
import { printJson } from "../../shared.js";

export const Challenges = Command.make(
  "challenges",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw challenge list as JSON.")),
  },
  Effect.fn("assignments.labs.challenges")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.listChallenges({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderChallenges(result.view));
  }),
).pipe(
  Command.withDescription("List challenge indexes and challenge IDs for one lab assignment."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs challenges 109348 3487324",
      description: "List challenge IDs and indexes for one lab assignment",
    },
  ]),
  Command.withAlias("k"),
);
