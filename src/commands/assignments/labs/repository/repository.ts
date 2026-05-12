import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { ChallengeId, ChallengeIndex, CourseId, AssignmentIdArgument } from "../../flags.js";
import { renderRepository } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Repository = Command.make(
  "repository",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    path: Flag.string("path").pipe(Flag.optional),
    json: Flag.boolean("json"),
  },
  Effect.fn("assignments.labs.repository")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.listRepository({
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
  Command.withDescription("List files and directories in a lab repository path."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs repository 109348 3487324",
      description: "Browse repository root entries",
    },
    {
      command: "open-educoder assignments labs repository 109348 3487324 --path case1",
      description: "Browse a specific repository directory",
    },
  ]),
  Command.withAlias("f"),
);
