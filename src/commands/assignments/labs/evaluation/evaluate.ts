import { stat } from "node:fs/promises";

import { Console, Effect } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import {
  AssignmentIdArgument,
  CommitId,
  CourseId,
  EnvironmentId,
  PositiveInteger,
  RepositoryPath,
  RequiredChallengeId,
  RequiredChallengeIndex,
  SecKey,
  TabType,
} from "../../flags.js";
import { renderGeneric } from "../../render.js";
import {
  AssignmentInputError,
  failInput,
  optionToUndefined,
  printJson,
  printStatusResponse,
  requireChallengeSelector,
  runningStatusMessage,
} from "../../shared.js";

const isMissingFileError = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";

const localFileExists = Effect.fn("assignments.labs.evaluate.localFileExists")(function* (path: string) {
  return yield* Effect.tryPromise({
    try: async () => {
      try {
        return (await stat(path)).isFile();
      } catch (error) {
        if (isMissingFileError(error)) {
          return false;
        }

        throw error;
      }
    },
    catch: (error) =>
      new AssignmentInputError({
        message: `Failed to inspect ${path}: ${error instanceof Error ? error.message : String(error)}`,
      }),
  });
});

export const Evaluate = Command.make(
  "evaluate",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    path: RepositoryPath.pipe(Argument.optional),
    challengeIndex: RequiredChallengeIndex,
    challengeId: RequiredChallengeId,
    secKey: SecKey.pipe(Flag.optional),
    commitId: CommitId.pipe(Flag.optional),
    contentModified: Flag.integer("content-modified").pipe(
      Flag.withDescription("Educoder content_modified code for snapshot evaluation requests."),
      Flag.withDefault(0),
    ),
    resubmit: Flag.string("resubmit").pipe(
      Flag.withDescription("Optional Educoder resubmit token."),
      Flag.withDefault(""),
    ),
    envId: EnvironmentId,
    tabType: TabType,
    poll: Flag.boolean("poll").pipe(Flag.withDescription("Keep checking status until a result or poll limit.")),
    pollInterval: PositiveInteger("poll-interval").pipe(
      Flag.withDescription("Seconds between status checks when --poll is used."),
      Flag.withDefault(2),
    ),
    pollLimit: PositiveInteger("poll-limit").pipe(
      Flag.withDescription("Maximum status checks when --poll is used."),
      Flag.withDefault(20),
    ),
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw evaluation response as JSON.")),
  },
  Effect.fn("assignments.labs.evaluate")(function* (input) {
    const path = optionToUndefined(input.path);
    const secKey = optionToUndefined(input.secKey);
    const commitId = optionToUndefined(input.commitId);
    const usesSnapshot = secKey !== undefined || commitId !== undefined;

    const labAssignmentFeature = yield* LabAssignmentFeature;

    if (usesSnapshot) {
      if (secKey === undefined || commitId === undefined) {
        return yield* failInput("Use --sec-key and --commit-id together.");
      }

      if (path !== undefined) {
        return yield* failInput("Use either a repository path or --sec-key/--commit-id, not both.");
      }

      if (input.poll) {
        return yield* failInput("Use status to check a saved snapshot evaluation after it starts.");
      }

      const result = yield* labAssignmentFeature.buildRepositoryFile({
        courseId: input.courseId,
        homeworkId: input.homeworkId,
        challengeIndex: optionToUndefined(input.challengeIndex),
        challengeId: optionToUndefined(input.challengeId),
        secKey,
        commitId,
        contentModified: input.contentModified,
        resubmit: input.resubmit,
        envId: optionToUndefined(input.envId),
        tabType: input.tabType,
      });

      if (input.json) {
        return yield* printJson(result.raw);
      }

      return yield* Console.log(renderGeneric("评测提交 / Evaluation Submission", { evaluate: result.raw }));
    }

    if (path === undefined) {
      return yield* failInput("Pass a repository path, or pass --sec-key and --commit-id for a saved snapshot.");
    }

    yield* requireChallengeSelector({
      challengeIndex: input.challengeIndex,
      challengeId: input.challengeId,
    });

    if (yield* localFileExists(path)) {
      return yield* failInput(
        `Local file ${path} exists, but evaluate only runs saved remote code. Run save or edit first, then evaluate.`,
      );
    }

    const result = yield* labAssignmentFeature.evaluateRepositoryFile({
      courseId: input.courseId,
      path,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
      envId: optionToUndefined(input.envId),
      tabType: input.tabType,
      poll: input.poll,
      pollInterval: input.pollInterval,
      pollLimit: input.pollLimit,
      onRunning: input.json
        ? undefined
        : ({ attempt, limit, response }) => {
            return Console.log(`[${attempt}/${limit}] ${runningStatusMessage(response) ?? "running"}`);
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
  Command.withDescription("Evaluate saved remote lab repository code and optionally poll for the result."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs evaluate 109348 3487324 case1/code.sh --challenge-index 1",
      description: "Evaluate the current remote repository file",
    },
    {
      command:
        "open-educoder assignments labs evaluate 109348 3487324 --sec-key ypzno7qmxwjt --commit-id 6a4abf53145fe87c261681074a51a4374fbba65a",
      description: "Evaluate a saved snapshot by sec key and commit id",
    },
    {
      command:
        "open-educoder assignments labs evaluate 109348 3487324 case1/code.sh --poll --poll-interval 2 --poll-limit 20 --challenge-index 1",
      description: "Evaluate and poll until completion",
    },
  ]),
  Command.withAlias("E"),
);
