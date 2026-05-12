import { Console, Effect, Option } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { AssignmentIdArgument, ChallengeId, ChallengeIndex, CourseId } from "../../flags.js";
import { renderLabTask } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

type TaskCommandInput = {
  readonly courseId: string;
  readonly homeworkId: string;
  readonly challengeIndex: Option.Option<number>;
  readonly challengeId: Option.Option<number>;
  readonly json: boolean;
};

const TaskConfig = {
  courseId: CourseId,
  homeworkId: AssignmentIdArgument,
  challengeIndex: ChallengeIndex,
  challengeId: ChallengeId,
  json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw resolved task response as JSON.")),
};

const runTask = Effect.fn("assignments.labs.task")(function* (input: TaskCommandInput) {
  const labAssignmentFeature = yield* LabAssignmentFeature;
  const result = yield* labAssignmentFeature.getTask({
    courseId: input.courseId,
    homeworkId: input.homeworkId,
    challengeIndex: optionToUndefined(input.challengeIndex),
    challengeId: optionToUndefined(input.challengeId),
  });

  if (input.json) {
    return yield* printJson(result.raw);
  }

  yield* Console.log(renderLabTask(result.view));
});

export const Task = Command.make("task", TaskConfig, runTask).pipe(
  Command.withDescription("Resolve the active lab task and show task ID, challenge, repository, and runtime context."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs task 109348 3487324",
      description: "Open the current lab task for one assignment",
    },
    {
      command: "open-educoder assignments labs task 109348 3487324 --challenge-index 1",
      description: "Open one challenge by visible index",
    },
  ]),
  Command.withAlias("t"),
);
