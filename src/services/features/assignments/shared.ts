import { Data, Effect, Option } from "effect";

import {
  type CurrentUser,
  type JsonRecord,
  asArray,
  asRecord,
  booleanField,
  decodeBase64,
  formatLabels,
  formatOperation,
  numberField,
  stringField,
} from "../shared.js";

export {
  asArray,
  asRecord,
  booleanField,
  decodeBase64,
  formatLabels,
  formatOperation,
  numberField,
  stringField,
  type CurrentUser,
  type JsonRecord,
};

export class AssignmentInputError extends Data.TaggedError("AssignmentInputError")<{
  readonly message: string;
}> {}

export type TaskContext = {
  readonly gameId: number;
  readonly challengeId: number;
  readonly challengePath: string;
  readonly workspaceId: number;
  readonly workspaceIdentifier: string;
  readonly environmentId: number;
};

export const AssignmentSortByChoices = ["created_at", "updated_at", "name_pinyin", "position"] as const;
export const AssignmentSortDirectionChoices = ["desc", "asc"] as const;

export const AssignmentTypeCode = {
  common: 1,
  lab: 4,
} as const;

export type AssignmentSortBy = (typeof AssignmentSortByChoices)[number];
export type AssignmentSortDirection = (typeof AssignmentSortDirectionChoices)[number];

export const failInput = (message: string) => Effect.fail(new AssignmentInputError({ message }));

export const makeTaskQuery = (taskId: string, homeworkId: string, login: string) => ({
  params: {
    taskId,
  },
  query: {
    homework_common_id: homeworkId,
    zzud: login,
  },
});

export const formatTaskInfo = (value: unknown) => {
  const root = asRecord(value);
  const game = asRecord(root?.["game"]);
  const challenge = asRecord(root?.["challenge"]);
  const lab = asRecord(root?.["shixun"]);
  const workspace = asRecord(root?.["myshixun"]);
  const user = asRecord(root?.["user"]);
  const environments = Object.fromEntries(
    asArray(root?.["shixun_environments"]).map((environment, index) => {
      const record = asRecord(environment);
      const id = numberField(record, "shixun_environment_id") ?? index + 1;

      return [
        id,
        {
          name: stringField(record, "name"),
          tabType: numberField(record, "tab_type"),
          resourceType: numberField(record, "resource_type"),
          tpiType: numberField(record, "tpi_type"),
        },
      ];
    }),
  );
  const testSets = Object.fromEntries(
    asArray(root?.["test_sets"]).map((testSet, index) => {
      const record = asRecord(testSet);

      return [
        index + 1,
        {
          public: booleanField(record, "is_public"),
          result: booleanField(record, "result"),
          expected: stringField(record, "output"),
          actual: stringField(record, "actual_output"),
          matchRule: stringField(record, "matchRule"),
        },
      ];
    }),
  );

  return {
    homework: {
      id: numberField(root, "homework_common_id"),
      name: stringField(root, "homework_common_name"),
      ended: booleanField(root, "homework_common_is_end"),
    },
    task: {
      identifier: stringField(game, "identifier"),
      gameId: numberField(game, "id"),
      status: numberField(game, "status"),
      finalScore: numberField(game, "final_score"),
      costTime: numberField(game, "cost_time"),
    },
    challenge: {
      id: numberField(challenge, "id"),
      position: numberField(challenge, "position"),
      subject: stringField(challenge, "subject"),
      score: numberField(challenge, "score"),
      path: stringField(challenge, "path"),
      difficulty: numberField(challenge, "difficulty"),
      execTime: numberField(challenge, "exec_time"),
    },
    lab: {
      id: numberField(lab, "id"),
      identifier: stringField(lab, "identifier"),
      name: stringField(lab, "name"),
      language: stringField(lab, "language"),
      status: numberField(root, "shixun_status"),
    },
    workspace: {
      id: numberField(workspace, "id"),
      identifier: stringField(workspace, "identifier"),
      status: numberField(workspace, "status"),
      commitId: stringField(workspace, "commit_id"),
    },
    user: {
      id: numberField(user, "user_id"),
      login: stringField(user, "login"),
      name: stringField(user, "name"),
    },
    environments,
    testSets,
  };
};

export const formatStatusResponse = (value: unknown) => {
  const root = asRecord(value);
  const runningStatus = numberField(root, "running_code_status");

  if (runningStatus !== null) {
    return {
      running: {
        status: runningStatus,
        message: stringField(root, "running_code_message"),
      },
    };
  }

  const testSets = Object.fromEntries(
    asArray(root?.["test_sets"]).map((testSet, index) => {
      const record = asRecord(testSet);

      return [
        index + 1,
        {
          result: booleanField(record, "result"),
          expected: stringField(record, "output"),
          actual: stringField(record, "actual_output"),
          compileSuccess: numberField(record, "compile_success"),
          time: numberField(record, "ts_time"),
          memory: numberField(record, "ts_mem"),
          matchRule: stringField(record, "matchRule"),
        },
      ];
    }),
  );

  return {
    result: {
      status: numberField(root, "status"),
      grade: numberField(root, "grade"),
      gold: numberField(root, "gold"),
      experience: numberField(root, "experience"),
      position: numberField(root, "position"),
      lastCompileOutput: stringField(root, "last_compile_output"),
      secKey: stringField(root, "sec_key"),
      testSetsCount: numberField(root, "test_sets_count"),
      errorCount: numberField(root, "sets_error_count"),
    },
    testSets,
  };
};

export const makeUpdateFilePayload = (input: {
  readonly homeworkId: string;
  readonly path: string;
  readonly content: string;
  readonly evaluate: boolean;
  readonly context: TaskContext;
  readonly user: CurrentUser;
  readonly tabType: number;
}) => ({
  path: input.path,
  evaluate: input.evaluate ? 1 : 0,
  content: input.content,
  game_id: input.context.gameId,
  tab_type: input.tabType,
  exercise_id: null,
  homework_common_id: input.homeworkId,
  extras: {
    exercise_id: "",
    question_id: "",
    challenge_id: input.context.challengeId,
    subject_id: "",
    homework_common_id: input.homeworkId,
    competition_entry_id: "",
    currentUserId: input.user.userId,
  },
});

export const makeGameBuildPayload = (input: {
  readonly homeworkId: string;
  readonly secKey: string;
  readonly resubmit: string;
  readonly commitId: string;
  readonly contentModified: number;
  readonly context: TaskContext;
  readonly user: CurrentUser;
  readonly tabType: number;
}) => ({
  sec_key: input.secKey,
  resubmit: input.resubmit,
  first: 1,
  content_modified: input.contentModified,
  shixun_environment_id: input.context.environmentId,
  tab_type: input.tabType,
  extras: {
    exercise_id: "",
    question_id: "",
    challenge_id: input.context.challengeId,
    subject_id: "",
    homework_common_id: input.homeworkId,
    competition_entry_id: "",
    commitID: input.commitId,
    currentUserId: input.user.userId,
  },
});

export const formatSaveResponse = (
  path: string,
  response: {
    readonly content: {
      readonly commitID: string;
      readonly size: number;
    };
    readonly sec_key: string | null | undefined;
    readonly resubmit: string | null | undefined;
    readonly content_modified: number;
  },
) => ({
  path,
  commitId: response.content.commitID,
  secKey: response.sec_key ?? null,
  resubmit: response.resubmit ?? null,
  contentModified: response.content_modified,
  size: response.content.size,
});

export const makeStatusRequest = (input: {
  readonly taskId: string;
  readonly homeworkId: string;
  readonly login: string;
  readonly secKey: string;
  readonly challengeId: number;
  readonly resubmit: string;
  readonly timeOut: boolean;
  readonly port: number;
  readonly subjectId: string;
}) => ({
  params: {
    taskId: input.taskId,
  },
  query: {
    resubmit: input.resubmit,
    time_out: input.timeOut,
    port: input.port,
    sec_key: input.secKey,
    challenge_id: input.challengeId,
    subject_id: input.subjectId,
    homework_common_id: input.homeworkId,
    zzud: input.login,
  },
});

export const optionToUndefined = <A>(value: Option.Option<A>): A | undefined =>
  Option.isSome(value) ? value.value : undefined;
