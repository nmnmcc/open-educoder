import { Buffer } from "node:buffer";

import { Data, Effect, Option } from "effect";

import type { EducoderApiResponse } from "../shared.js";

type TaskInfoRaw = EducoderApiResponse<"Task", "info">;
type GameStatusRaw = EducoderApiResponse<"Task", "gameStatus">;
type RunningGameStatusRaw = Extract<GameStatusRaw, { readonly running_code_status: number }>;
type TaskOperation = readonly [string, string, boolean?];

export type CurrentUser = {
  readonly login: string;
  readonly userId: number;
};

export const decodeBase64 = (value: string) => Buffer.from(value, "base64").toString("utf8");

export const formatLabels = (labels: ReadonlyArray<string>) => labels.join(", ");

export const formatOperation = (operation: TaskOperation | null | undefined) => ({
  action: operation?.[0] ?? null,
  path: operation?.[1] ?? null,
  resumed: operation?.[2] ?? null,
});

export const isRunningStatusResponse = (value: GameStatusRaw): value is RunningGameStatusRaw =>
  "running_code_status" in value;

export const runningStatusMessage = (value: GameStatusRaw) =>
  isRunningStatusResponse(value) ? value.running_code_message : null;

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

export const formatTaskInfo = (value: TaskInfoRaw) => {
  const lab = value.shixun;
  const user = value.user;
  const environments = Object.fromEntries(
    (value.shixun_environments ?? []).map((environment, index) => {
      const id = environment.shixun_environment_id ?? index + 1;

      return [
        id,
        {
          name: environment.name ?? null,
          tabType: environment.tab_type ?? null,
          resourceType: environment.resource_type ?? null,
          tpiType: environment.tpi_type ?? null,
        },
      ];
    }),
  );
  const testSets = Object.fromEntries(
    (value.test_sets ?? []).map((testSet, index) => {
      return [
        index + 1,
        {
          public: testSet.is_public ?? null,
          result: testSet.result ?? null,
          expected: testSet.output ?? null,
          actual: testSet.actual_output ?? null,
          matchRule: testSet.matchRule ?? null,
        },
      ];
    }),
  );

  return {
    homework: {
      id: value.homework_common_id ?? null,
      name: value.homework_common_name ?? null,
      ended: value.homework_common_is_end ?? null,
    },
    task: {
      identifier: value.game.identifier ?? null,
      gameId: value.game.id ?? null,
      status: value.game.status ?? null,
      finalScore: value.game.final_score ?? null,
      costTime: value.game.cost_time ?? null,
    },
    challenge: {
      id: value.challenge.id ?? null,
      position: value.challenge.position ?? null,
      subject: value.challenge.subject ?? null,
      score: value.challenge.score ?? null,
      path: value.challenge.path ?? null,
      difficulty: value.challenge.difficulty ?? null,
      execTime: value.challenge.exec_time ?? null,
    },
    lab: {
      id: lab?.id ?? null,
      identifier: lab?.identifier ?? null,
      name: lab?.name ?? null,
      language: lab?.language ?? null,
      status: value.shixun_status ?? null,
    },
    workspace: {
      id: value.myshixun.id ?? null,
      identifier: value.myshixun.identifier ?? null,
      status: value.myshixun.status ?? null,
      commitId: value.myshixun.commit_id ?? null,
    },
    user: {
      id: user?.user_id ?? null,
      login: user?.login ?? null,
      name: user?.name ?? null,
    },
    environments,
    testSets,
  };
};

export const formatStatusResponse = (value: GameStatusRaw) => {
  if (isRunningStatusResponse(value)) {
    return {
      running: {
        status: value.running_code_status,
        message: value.running_code_message,
      },
    };
  }

  const testSets = Object.fromEntries(
    (value.test_sets ?? []).map((testSet, index) => {
      return [
        index + 1,
        {
          result: testSet.result ?? null,
          expected: testSet.output ?? null,
          actual: testSet.actual_output ?? null,
          compileSuccess: testSet.compile_success ?? null,
          time: testSet.ts_time ?? null,
          memory: testSet.ts_mem ?? null,
          matchRule: testSet.matchRule ?? null,
        },
      ];
    }),
  );

  return {
    result: {
      status: value.status,
      grade: value.grade ?? null,
      gold: value.gold ?? null,
      experience: value.experience ?? null,
      position: value.position ?? null,
      lastCompileOutput: value.last_compile_output ?? null,
      secKey: value.sec_key ?? null,
      testSetsCount: value.test_sets_count ?? null,
      errorCount: value.sets_error_count ?? null,
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
