import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import {
  Content,
  ContentFile,
  CourseId,
  EnvironmentId,
  AssignmentIdArgument,
  PositiveInteger,
  RepositoryPath,
  RequiredChallengeId,
  RequiredChallengeIndex,
  TabType,
} from "../../flags.js";
import { renderGeneric } from "../../render.js";
import {
  asRecord,
  optionToUndefined,
  printJson,
  printStatusResponse,
  readOptionalContent,
  requireChallengeSelector,
  stringField,
} from "../../shared.js";

export const Evaluate = Command.make(
  "evaluate",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    path: RepositoryPath,
    challengeIndex: RequiredChallengeIndex,
    challengeId: RequiredChallengeId,
    content: Content,
    file: ContentFile,
    envId: EnvironmentId,
    tabType: TabType,
    poll: Flag.boolean("poll"),
    pollInterval: PositiveInteger("poll-interval").pipe(Flag.withDefault(2)),
    pollLimit: PositiveInteger("poll-limit").pipe(Flag.withDefault(20)),
    json: Flag.boolean("json"),
  },
  Effect.fn("assignments.labs.evaluate")(function* (input) {
    yield* requireChallengeSelector({
      challengeIndex: input.challengeIndex,
      challengeId: input.challengeId,
    });
    const content = yield* readOptionalContent({
      content: input.content,
      file: input.file,
    });
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.evaluateRepositoryFile({
      courseId: input.courseId,
      path: input.path,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
      content,
      envId: optionToUndefined(input.envId),
      tabType: input.tabType,
      poll: input.poll,
      pollInterval: input.pollInterval,
      pollLimit: input.pollLimit,
      onRunning: input.json
        ? undefined
        : ({ attempt, limit, response }) => {
            const running = asRecord(response);

            return Console.log(`[${attempt}/${limit}] ${stringField(running, "running_code_message") ?? "running"}`);
          },
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    if (result.raw.status !== null) {
      return yield* printStatusResponse(result.raw.status, false);
    }

    yield* Console.log(renderGeneric("评测提交 / Evaluation Submission", result.view));
  }),
).pipe(
  Command.withDescription("Submit a file for evaluation and optionally poll until a result is available."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs evaluate 109348 3487324 case1/code.sh --file ./code.sh",
      description: "Save and evaluate one repository file",
    },
    {
      command:
        "open-educoder assignments labs evaluate 109348 3487324 case1/code.sh --file ./code.sh --poll --poll-interval 2 --poll-limit 20",
      description: "Save, evaluate, and poll until completion",
    },
  ]),
  Command.withAlias("E"),
);
