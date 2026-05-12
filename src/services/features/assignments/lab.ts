import { Context, Effect, Layer } from "effect";
import { init as initMarkdownRenderer, parseMeta, renderToAnsi, renderToText } from "md4x/wasm";

import { AppContext } from "../../context/index.js";
import { EducoderApi } from "../../educoder-api/index.js";
import { type EducoderApiResponse, type FeatureWorkflow } from "../shared.js";
import {
  type AssignmentSortBy,
  type AssignmentSortDirection,
  AssignmentTypeCode,
  type CurrentUser,
  type TaskContext,
  decodeBase64,
  failInput,
  formatLabels,
  formatOperation,
  formatSaveResponse,
  formatStatusResponse,
  formatTaskInfo,
  isRunningStatusResponse,
  makeGameBuildPayload,
  makeStatusRequest,
  makeTaskQuery,
  makeUpdateFilePayload,
} from "./shared.js";

type ListLabAssignmentsInput = {
  readonly courseId: string;
  readonly category?: number | undefined;
  readonly status: number;
  readonly page: number;
  readonly limit: number;
  readonly order?: number | undefined;
  readonly search?: string | undefined;
  readonly sortBy?: AssignmentSortBy | undefined;
  readonly sortDirection?: AssignmentSortDirection | undefined;
};

type LabTaskSelector = {
  readonly courseId?: string | undefined;
  readonly homeworkId: string;
  readonly taskId?: string | undefined;
  readonly challengeIndex?: number | undefined;
  readonly challengeId?: number | undefined;
};

type SelectedChallenge = {
  readonly index: number;
  readonly challengeId: number;
  readonly name: string;
};

type LabTaskInput = LabTaskSelector & {
  readonly courseId: string;
};

type LabLearningContentInput = LabTaskSelector;

type ListLabChallengesInput = {
  readonly courseId?: string | undefined;
  readonly homeworkId: string;
};

type LabRepositoryContentInput = LabTaskSelector & {
  readonly path: string;
  readonly exerciseId: string;
};

type ListLabRepositoryInput = LabTaskSelector & {
  readonly path?: string | undefined;
};

type SaveLabRepositoryFileInput = LabTaskSelector & {
  readonly path: string;
  readonly content: string;
  readonly evaluate: boolean;
  readonly envId?: number | undefined;
  readonly tabType: number;
};

type LabTaskWithAssignmentInput = LabTaskSelector;

type LabTaskWithPathInput = LabTaskSelector & {
  readonly path: string;
};

type BuildLabRepositoryFileInput = LabTaskSelector & {
  readonly secKey: string;
  readonly commitId: string;
  readonly contentModified: number;
  readonly resubmit: string;
  readonly envId?: number | undefined;
  readonly tabType: number;
};

type LabEvaluationStatusInput = LabTaskSelector & {
  readonly secKey: string;
  readonly resubmit: string;
  readonly timeOut: boolean;
  readonly port: number;
  readonly subjectId: string;
};

type EvaluateLabRepositoryFileInput = LabTaskSelector & {
  readonly path: string;
  readonly content?: string | undefined;
  readonly envId?: number | undefined;
  readonly tabType: number;
  readonly poll: boolean;
  readonly pollInterval: number;
  readonly pollLimit: number;
  readonly onRunning?:
    | ((event: {
        readonly attempt: number;
        readonly limit: number;
        readonly response: GameStatusRaw;
      }) => Effect.Effect<void>)
    | undefined;
};

type LabLogsInput = LabTaskSelector & {
  readonly envId?: number | undefined;
  readonly tabType: number;
};

type LabEnvironmentInput = LabTaskSelector & {
  readonly envId?: number | undefined;
};

type StartLabSshInput = LabTaskSelector & {
  readonly envId?: number | undefined;
  readonly tabType: number;
  readonly resolveArgs?: boolean | undefined;
};

type HomeworkCommonsRaw = EducoderApiResponse<"Course", "homeworkCommons">;
type HomeworkInfoRaw = EducoderApiResponse<"HomeworkCommon", "info">;
type LabChallengeDataRaw = EducoderApiResponse<"HomeworkCommon", "shixunChallengeData">;
type LabExecRaw = EducoderApiResponse<"Shixun", "exec">;
type TaskInfoRaw = EducoderApiResponse<"Task", "info">;
type RepositoryContentRaw = EducoderApiResponse<"Task", "repContent">;
type RepositoryRaw = EducoderApiResponse<"Myshixun", "repository">;
type UpdateFileRaw = EducoderApiResponse<"Myshixun", "updateFile">;
type ResetPassedCodeRaw = EducoderApiResponse<"Task", "resetPassedCode">;
type ResetRepositoryRaw = EducoderApiResponse<"Myshixun", "resetRepository">;
type VersionRepositoryDeleteRaw = EducoderApiResponse<"Myshixun", "versionRepositoryDelete">;
type GameBuildRaw = EducoderApiResponse<"Task", "gameBuild">;
type GameStatusRaw = EducoderApiResponse<"Task", "gameStatus">;
type LogOutputRaw = EducoderApiResponse<"Task", "logOutput">;
type SimpleTaskRaw = EducoderApiResponse<"Task", "commitFiles">;
type RemainingTimeRaw = EducoderApiResponse<"Myshixun", "getRemainingTime">;
type StartSshRaw = EducoderApiResponse<"Myshixun", "start">;

type ListLabAssignmentsView = {
  readonly total: number;
  readonly order: ReadonlyArray<string>;
  readonly filters: {
    readonly status: number;
    readonly order: number;
    readonly search: string | null;
    readonly sortBy: AssignmentSortBy | null;
    readonly sortDirection: AssignmentSortDirection | null;
  };
  readonly category: {
    readonly id: number | null;
    readonly name: string;
    readonly total: number;
    readonly published: number;
    readonly unpublished: number;
  };
  readonly assignments: Record<
    string,
    {
      readonly name: string;
      readonly category: string | null;
      readonly status: string;
      readonly statusTime: string;
      readonly timeStatus: number;
      readonly allowLate: boolean;
      readonly author: string;
      readonly created: string;
      readonly publishTime: string;
      readonly endTime: string;
      readonly lateTime: string;
      readonly studentWorkId: number;
      readonly labIdentifier: string | null;
      readonly workspaceIdentifier: string | null;
      readonly progress: {
        readonly finished: number | null;
        readonly checked: number | null;
        readonly total: number | null;
      };
      readonly operation: ReturnType<typeof formatOperation>;
      readonly labStatus: number | null;
    }
  >;
};

type ResolveLabTaskRaw = {
  readonly exec: LabExecRaw | null;
  readonly task: TaskInfoRaw;
};
type ResolveLabTaskView = {
  readonly taskId: string;
  readonly homeworkId: string;
  readonly courseId: string | null;
  readonly labIdentifier: string | null;
  readonly challengeId: number | null;
  readonly challengeIndex: number | null;
  readonly challengeName: string | null;
};
type LabChallengeListView = {
  readonly assignment: {
    readonly courseId: string | null;
    readonly homeworkId: string;
    readonly name: string | null;
    readonly labIdentifier: string | null;
  };
  readonly summary: {
    readonly score: string;
    readonly evaluateCount: number;
    readonly timeConsuming: string;
    readonly passed: number;
    readonly pending: number;
  };
  readonly challenges: ReadonlyArray<{
    readonly index: number;
    readonly challengeId: number;
    readonly name: string;
    readonly score: number;
    readonly status: string;
    readonly difficulty: string;
    readonly passedStatus: number;
    readonly gameScore: string;
    readonly evaluateCount: number;
    readonly timeConsuming: string;
    readonly knowledgePoints: string;
    readonly operation: ReturnType<typeof formatOperation>;
  }>;
};
type LabTaskView = ReturnType<typeof formatTaskInfo> & {
  readonly resolved: ResolveLabTaskView;
};
type LabLearningContentView = {
  readonly resolved: ResolveLabTaskView;
  readonly challenge: {
    readonly id: number | null;
    readonly index: number | null;
    readonly name: string | null;
  };
  readonly content: {
    readonly markdown: string;
    readonly ansi: string;
    readonly text: string;
    readonly headings: ReadonlyArray<string>;
  };
};
type RepositoryContentView = RepositoryContentRaw & {
  readonly decodedContent: string;
};
type RepositoryView = {
  readonly repository: {
    readonly path: string;
    readonly entries: Record<
      string,
      {
        readonly type: string;
        readonly path: string;
      }
    >;
  };
};
type SaveLabFileView = {
  readonly saved: ReturnType<typeof formatSaveResponse>;
};
type ResetLabRepositoryView = {
  readonly reset: ResetRepositoryRaw;
};
type PruneLabRepositoryView = {
  readonly prune: VersionRepositoryDeleteRaw;
};
type BuildLabRepositoryFileView = {
  readonly build: GameBuildRaw;
};
type LabEvaluationStatusView = ReturnType<typeof formatStatusResponse>;
type EvaluateLabRepositoryFileRaw = {
  readonly save: UpdateFileRaw;
  readonly build: GameBuildRaw;
  readonly status: GameStatusRaw | null;
};
type EvaluateLabRepositoryFileView =
  | LabEvaluationStatusView
  | {
      readonly evaluate: {
        readonly path: string;
        readonly commitId: string;
        readonly secKey: string;
        readonly build: GameBuildRaw;
      };
    };
type LabLogsView = {
  readonly logs: LogOutputRaw;
};
type SimpleTaskView<Key extends string> = Record<Key, SimpleTaskRaw>;
type RemainingTimeView = {
  readonly remainingTime: number;
};
type StartSshView = {
  readonly sshArgs: ReadonlyArray<string> | null;
};

export type LabAssignmentFeatureShape = {
  readonly list: FeatureWorkflow<ListLabAssignmentsInput, HomeworkCommonsRaw, ListLabAssignmentsView>;
  readonly listChallenges: FeatureWorkflow<ListLabChallengesInput, LabChallengeDataRaw, LabChallengeListView>;
  readonly resolveTask: FeatureWorkflow<LabTaskInput, ResolveLabTaskRaw, ResolveLabTaskView>;
  readonly getTask: FeatureWorkflow<LabTaskInput, TaskInfoRaw, LabTaskView>;
  readonly getLearningContent: FeatureWorkflow<LabLearningContentInput, TaskInfoRaw, LabLearningContentView>;
  readonly getRepositoryContent: FeatureWorkflow<
    LabRepositoryContentInput,
    RepositoryContentRaw,
    RepositoryContentView
  >;
  readonly listRepository: FeatureWorkflow<ListLabRepositoryInput, RepositoryRaw, RepositoryView>;
  readonly saveRepositoryFile: FeatureWorkflow<SaveLabRepositoryFileInput, UpdateFileRaw, SaveLabFileView>;
  readonly getPassedCode: FeatureWorkflow<LabTaskWithPathInput, ResetPassedCodeRaw, ResetPassedCodeRaw>;
  readonly resetRepository: FeatureWorkflow<LabTaskWithAssignmentInput, ResetRepositoryRaw, ResetLabRepositoryView>;
  readonly pruneRepository: FeatureWorkflow<
    LabTaskWithAssignmentInput,
    VersionRepositoryDeleteRaw,
    PruneLabRepositoryView
  >;
  readonly buildRepositoryFile: FeatureWorkflow<BuildLabRepositoryFileInput, GameBuildRaw, BuildLabRepositoryFileView>;
  readonly getEvaluationStatus: FeatureWorkflow<LabEvaluationStatusInput, GameStatusRaw, LabEvaluationStatusView>;
  readonly evaluateRepositoryFile: FeatureWorkflow<
    EvaluateLabRepositoryFileInput,
    EvaluateLabRepositoryFileRaw,
    EvaluateLabRepositoryFileView
  >;
  readonly getLogs: FeatureWorkflow<LabLogsInput, LogOutputRaw, LabLogsView>;
  readonly commitFiles: FeatureWorkflow<LabEnvironmentInput, SimpleTaskRaw, SimpleTaskView<"commit">>;
  readonly pullFiles: FeatureWorkflow<LabEnvironmentInput, SimpleTaskRaw, SimpleTaskView<"pull">>;
  readonly getRemainingTime: FeatureWorkflow<LabTaskWithAssignmentInput, RemainingTimeRaw, RemainingTimeView>;
  readonly startSsh: FeatureWorkflow<StartLabSshInput, StartSshRaw, StartSshView>;
};

export class LabAssignmentFeature extends Context.Service<LabAssignmentFeature, LabAssignmentFeatureShape>()(
  "open-educoder/services/features/LabAssignmentFeature",
) {
  public static readonly layer = Layer.effect(
    LabAssignmentFeature,
    Effect.gen(function* () {
      const ctx = yield* AppContext;
      const educoder = yield* EducoderApi;

      const resolveCurrentUser = Effect.fn("features.assignments.labs.resolveCurrentUser")(function* () {
        const user = yield* ctx.user;

        return {
          login: user.login,
          userId: user.user_id,
        } satisfies CurrentUser;
      });

      const resolveLogin = Effect.fn("features.assignments.labs.resolveLogin")(function* () {
        const user = yield* resolveCurrentUser();

        return user.login;
      });

      const fetchTaskInfo = Effect.fn("features.assignments.labs.fetchTaskInfo")(function* (input: {
        readonly taskId: string;
        readonly homeworkId: string;
        readonly login: string;
      }) {
        return yield* educoder.Task.info(makeTaskQuery(input.taskId, input.homeworkId, input.login));
      });

      const fetchAssignmentInfo = Effect.fn("features.assignments.labs.fetchAssignmentInfo")(function* (input: {
        readonly homeworkId: string;
        readonly login: string;
      }) {
        return yield* educoder.HomeworkCommon.info({
          params: {
            homeworkId: input.homeworkId,
          },
          query: {
            zzud: input.login,
          },
        });
      });

      const fetchChallengeData = Effect.fn("features.assignments.labs.fetchChallengeData")(function* (input: {
        readonly homeworkId: string;
        readonly login: string;
      }) {
        return yield* educoder.HomeworkCommon.shixunChallengeData({
          params: {
            homeworkId: input.homeworkId,
          },
          query: {
            zzud: input.login,
          },
        });
      });

      const resolveLabIdentifier = Effect.fn("features.assignments.labs.resolveLabIdentifier")(function* (input: {
        readonly homeworkId: string;
        readonly login: string;
      }) {
        const homework = yield* fetchAssignmentInfo(input);
        const labIdentifier = homework.shixun_identifier ?? parseLabIdentifier(homework.task_operation);

        if (labIdentifier === null) {
          return yield* failInput(`Cannot infer lab id for assignment ${input.homeworkId}.`);
        }

        return {
          homework,
          labIdentifier,
        };
      });

      const listChallenges: LabAssignmentFeatureShape["listChallenges"] = Effect.fn(
        "features.assignments.labs.challenges",
      )(function* (input) {
        const login = yield* resolveLogin();
        const homework = yield* fetchAssignmentInfo({ homeworkId: input.homeworkId, login });
        const raw = yield* fetchChallengeData({ homeworkId: input.homeworkId, login });

        return {
          raw,
          view: formatChallengeList(input, homework, raw),
        };
      });

      const resolveSelectedChallenge = Effect.fn("features.assignments.labs.resolveSelectedChallenge")(function* (
        input: LabTaskSelector & { readonly login: string },
      ) {
        if (input.challengeIndex !== undefined && input.challengeId !== undefined) {
          return yield* failInput("Use either --challenge-index or --challenge-id, not both.");
        }

        if (input.challengeIndex === undefined && input.challengeId === undefined) {
          return null;
        }

        const raw = yield* fetchChallengeData({ homeworkId: input.homeworkId, login: input.login });
        const challenges = raw.data.challenge_settings;

        if (input.challengeIndex !== undefined) {
          const index = input.challengeIndex;

          if (!Number.isInteger(index) || index < 1 || index > challenges.length) {
            return yield* failInput(
              `Challenge index must be between 1 and ${challenges.length}; got ${String(input.challengeIndex)}.`,
            );
          }

          const challenge = challenges[index - 1]!;

          return {
            index,
            challengeId: challenge.challenge_id,
            name: challenge.challenge_name,
          };
        }

        const challenge = challenges.find((item) => item.challenge_id === input.challengeId);

        if (challenge === undefined) {
          return yield* failInput(
            `Unknown challenge id ${String(input.challengeId)}. Available ids: ${challenges
              .map((item) => item.challenge_id)
              .join(", ")}.`,
          );
        }

        return {
          index: challenges.indexOf(challenge) + 1,
          challengeId: challenge.challenge_id,
          name: challenge.challenge_name,
        };
      });

      const findTaskForChallenge = Effect.fn("features.assignments.labs.findTaskForChallenge")(function* (input: {
        readonly initialTaskId: string;
        readonly homeworkId: string;
        readonly login: string;
        readonly challengeId: number;
      }) {
        const pending = [input.initialTaskId];
        const visited = new Set<string>();

        while (pending.length > 0 && visited.size < 64) {
          const taskId = pending.shift()!;

          if (visited.has(taskId)) {
            continue;
          }

          visited.add(taskId);

          const task = yield* fetchTaskInfo({ taskId, homeworkId: input.homeworkId, login: input.login });

          if (task.challenge.id === input.challengeId) {
            return {
              taskId,
              task,
            };
          }

          for (const candidate of [task.prev_game, task.next_game]) {
            if (candidate !== null && candidate !== undefined && !visited.has(candidate)) {
              pending.push(candidate);
            }
          }
        }

        return yield* failInput(`Cannot resolve task for challenge ${input.challengeId}.`);
      });

      const resolveTask: LabAssignmentFeatureShape["resolveTask"] = Effect.fn("features.assignments.labs.resolveTask")(
        function* (input) {
          const login = yield* resolveLogin();
          const selectedChallenge = yield* resolveSelectedChallenge({ ...input, login });
          const resolvedByAssignment =
            input.taskId === undefined ? yield* resolveLabIdentifier({ homeworkId: input.homeworkId, login }) : null;
          const exec =
            input.taskId === undefined
              ? yield* educoder.Shixun.exec({
                  params: {
                    shixunId: resolvedByAssignment!.labIdentifier,
                  },
                  query: {
                    homework_common_id: input.homeworkId,
                    zzud: login,
                  },
                })
              : null;
          const initialTaskId = input.taskId ?? exec!.game_identifier;
          const resolved =
            selectedChallenge === null
              ? {
                  taskId: initialTaskId,
                  task: yield* fetchTaskInfo({
                    taskId: initialTaskId,
                    homeworkId: input.homeworkId,
                    login,
                  }),
                }
              : yield* findTaskForChallenge({
                  initialTaskId,
                  homeworkId: input.homeworkId,
                  login,
                  challengeId: selectedChallenge.challengeId,
                });

          return {
            raw: {
              exec,
              task: resolved.task,
            },
            view: formatResolvedTask(
              input,
              resolved.taskId,
              resolved.task,
              selectedChallenge,
              resolvedByAssignment?.homework,
            ),
          };
        },
      );

      const resolveAssignmentContext = Effect.fn("features.assignments.labs.resolveAssignmentContext")(function* (
        input: LabTaskSelector & {
          readonly envId?: number | undefined;
          readonly tabType: number;
        },
      ) {
        const user = yield* resolveCurrentUser();
        const resolved = yield* resolveTask({ ...input, courseId: input.courseId ?? "" });
        const context = yield* parseTaskContext(resolved.raw.task, input.envId, input.tabType);

        return {
          user,
          taskId: resolved.view.taskId,
          context,
        };
      });

      const fetchRepositoryContent = Effect.fn("features.assignments.labs.fetchRepositoryContent")(function* (input: {
        readonly taskId: string;
        readonly homeworkId: string;
        readonly path: string;
        readonly exerciseId: string;
        readonly login: string;
      }) {
        return yield* educoder.Task.repContent({
          params: {
            taskId: input.taskId,
          },
          query: {
            path: input.path,
            homework_common_id: input.homeworkId,
            exercise_id: input.exerciseId,
            zzud: input.login,
          },
        });
      });

      const updateRepositoryFile = Effect.fn("features.assignments.labs.updateRepositoryFile")(function* (input: {
        readonly homeworkId: string;
        readonly path: string;
        readonly content: string;
        readonly evaluate: boolean;
        readonly context: TaskContext;
        readonly user: CurrentUser;
        readonly tabType: number;
      }) {
        return yield* educoder.Myshixun.updateFile({
          params: {
            myshixunId: input.context.workspaceIdentifier,
          },
          query: {
            zzud: input.user.login,
          },
          payload: makeUpdateFilePayload(input),
        });
      });

      const triggerRepositoryBuild = Effect.fn("features.assignments.labs.triggerRepositoryBuild")(function* (input: {
        readonly taskId: string;
        readonly homeworkId: string;
        readonly secKey: string;
        readonly resubmit: string;
        readonly commitId: string;
        readonly contentModified: number;
        readonly context: TaskContext;
        readonly user: CurrentUser;
        readonly tabType: number;
      }) {
        return yield* educoder.Task.gameBuild({
          params: {
            taskId: input.taskId,
          },
          query: {
            zzud: input.user.login,
          },
          payload: makeGameBuildPayload(input),
        });
      });

      const pollGameStatus = Effect.fn("features.assignments.labs.pollGameStatus")(function* (input: {
        readonly taskId: string;
        readonly homeworkId: string;
        readonly login: string;
        readonly secKey: string;
        readonly challengeId: number;
        readonly resubmit: string;
        readonly timeOut: boolean;
        readonly port: number;
        readonly subjectId: string;
        readonly interval: number;
        readonly limit: number;
        readonly onRunning?:
          | ((event: {
              readonly attempt: number;
              readonly limit: number;
              readonly response: GameStatusRaw;
            }) => Effect.Effect<void>)
          | undefined;
      }) {
        if (input.limit < 1) {
          return yield* failInput("Poll limit must be greater than or equal to 1.");
        }

        let lastResponse: GameStatusRaw | null = null;

        for (let attempt = 1; attempt <= input.limit; attempt += 1) {
          const response = yield* educoder.Task.gameStatus(
            makeStatusRequest({
              taskId: input.taskId,
              homeworkId: input.homeworkId,
              login: input.login,
              secKey: input.secKey,
              challengeId: input.challengeId,
              resubmit: input.resubmit,
              timeOut: input.timeOut,
              port: input.port,
              subjectId: input.subjectId,
            }),
          );
          lastResponse = response;

          if (!isRunningStatusResponse(response)) {
            return response;
          }

          if (input.onRunning !== undefined) {
            yield* input.onRunning({ attempt, limit: input.limit, response });
          }

          if (attempt < input.limit) {
            yield* Effect.sleep(`${input.interval} seconds`);
          }
        }

        if (lastResponse === null) {
          return yield* failInput("Poll limit must be greater than or equal to 1.");
        }

        return lastResponse;
      });

      const list: LabAssignmentFeatureShape["list"] = Effect.fn("features.assignments.labs.list")(function* (input) {
        const login = yield* resolveLogin();
        const order = input.order ?? input.status;
        const raw = yield* educoder.Course.homeworkCommons({
          params: {
            courseId: input.courseId,
          },
          query: {
            coursesId: input.courseId,
            id: input.courseId,
            limit: input.limit,
            type: AssignmentTypeCode.lab,
            status: input.status,
            category: input.category,
            page: input.page,
            order,
            search: input.search,
            sort_by: input.sortBy,
            sort_direction: input.sortDirection,
            zzud: login,
          },
        });

        return {
          raw,
          view: {
            total: raw.query_total_count,
            order: raw.homeworks.map((item) => String(item.homework_id)),
            filters: {
              status: input.status,
              order,
              search: input.search ?? null,
              sortBy: input.sortBy ?? null,
              sortDirection: input.sortDirection ?? null,
            },
            category: {
              id: raw.category_id ?? null,
              name: raw.category_name ?? raw.main_category_name,
              total: raw.query_total_count,
              published: raw.published_count,
              unpublished: raw.unpublished_count,
            },
            assignments: Object.fromEntries(
              raw.homeworks.map((item) => {
                const base = {
                  name: item.name,
                  category: item.upper_category_name ?? raw.category_name ?? null,
                  status: formatLabels(item.status),
                  statusTime: item.status_time,
                  timeStatus: item.time_status,
                  allowLate: item.allow_late,
                  author: item.author,
                  created: item.created_at,
                  publishTime: item.publish_time,
                  endTime: item.end_time,
                  lateTime: item.late_time,
                  studentWorkId: item.student_work_id,
                };

                return [
                  item.homework_id,
                  {
                    ...base,
                    labIdentifier: item.shixun_identifier ?? null,
                    workspaceIdentifier: item.myshixun_identifier ?? null,
                    progress: {
                      finished: item.finished_challenge_count ?? null,
                      checked: item.checked_challenge_count ?? null,
                      total: item.challenge_count ?? null,
                    },
                    operation: formatOperation(item.task_operation),
                    labStatus: item.shixun_finished_status ?? null,
                  },
                ];
              }),
            ),
          },
        };
      });

      const getTask: LabAssignmentFeatureShape["getTask"] = Effect.fn("features.assignments.labs.task")(
        function* (input) {
          const resolved = yield* resolveTask(input);
          const raw = resolved.raw.task;

          return {
            raw,
            view: {
              ...formatTaskInfo(raw),
              resolved: resolved.view,
            },
          };
        },
      );

      const getLearningContent: LabAssignmentFeatureShape["getLearningContent"] = Effect.fn(
        "features.assignments.labs.learning",
      )(function* (input) {
        const resolved = yield* resolveTask({ ...input, courseId: input.courseId ?? "" });
        const raw = resolved.raw.task;
        const markdown = raw.challenge.task_pass;

        if (typeof markdown !== "string" || markdown.trim().length === 0) {
          return yield* failInput("This lab challenge does not include learning content.");
        }

        return {
          raw,
          view: {
            resolved: resolved.view,
            challenge: {
              id: raw.challenge.id ?? null,
              index: raw.challenge.position ?? null,
              name: raw.challenge.subject ?? null,
            },
            content: yield* renderLearningContent(markdown),
          },
        };
      });

      const getRepositoryContent: LabAssignmentFeatureShape["getRepositoryContent"] = Effect.fn(
        "features.assignments.labs.content",
      )(function* (input) {
        const login = yield* resolveLogin();
        const resolved = yield* resolveTask({ ...input, courseId: input.courseId ?? "" });
        const raw = yield* fetchRepositoryContent({
          taskId: resolved.view.taskId,
          path: input.path,
          homeworkId: input.homeworkId,
          exerciseId: input.exerciseId,
          login,
        });
        const decodedContent = decodeBase64(raw.content.content);

        return {
          raw,
          view: {
            ...raw,
            decodedContent,
          },
        };
      });

      const listRepository: LabAssignmentFeatureShape["listRepository"] = Effect.fn(
        "features.assignments.labs.repository",
      )(function* (input) {
        const { user, context } = yield* resolveAssignmentContext({
          courseId: input.courseId,
          homeworkId: input.homeworkId,
          challengeIndex: input.challengeIndex,
          challengeId: input.challengeId,
          tabType: 1,
        });
        const path = input.path ?? "";
        const raw = yield* educoder.Myshixun.repository({
          params: {
            myshixunId: context.workspaceIdentifier,
          },
          query: {
            zzud: user.login,
          },
          payload: path.length >= 1 ? { path } : {},
        });

        return {
          raw,
          view: {
            repository: {
              path: path.length >= 1 ? path : ".",
              entries: Object.fromEntries(
                raw.trees.map((entry) => [
                  entry.name,
                  {
                    type: entry.type,
                    path: path.length >= 1 ? `${path}/${entry.name}` : entry.name,
                  },
                ]),
              ),
            },
          },
        };
      });

      const saveRepositoryFile: LabAssignmentFeatureShape["saveRepositoryFile"] = Effect.fn(
        "features.assignments.labs.save",
      )(function* (input) {
        const { user, context } = yield* resolveAssignmentContext({
          courseId: input.courseId,
          homeworkId: input.homeworkId,
          challengeIndex: input.challengeIndex,
          challengeId: input.challengeId,
          envId: input.envId,
          tabType: input.tabType,
        });
        const raw = yield* updateRepositoryFile({
          homeworkId: input.homeworkId,
          path: input.path,
          content: input.content,
          evaluate: input.evaluate,
          context,
          user,
          tabType: input.tabType,
        });

        return {
          raw,
          view: {
            saved: formatSaveResponse(input.path, raw),
          },
        };
      });

      const getPassedCode: LabAssignmentFeatureShape["getPassedCode"] = Effect.fn("features.assignments.labs.passed")(
        function* (input) {
          const login = yield* resolveLogin();
          const resolved = yield* resolveTask({ ...input, courseId: input.courseId ?? "" });
          const raw = yield* educoder.Task.resetPassedCode({
            params: {
              taskId: resolved.view.taskId,
            },
            query: {
              path: input.path,
              zzud: login,
            },
          });

          return {
            raw,
            view: raw,
          };
        },
      );

      const resetRepository: LabAssignmentFeatureShape["resetRepository"] = Effect.fn(
        "features.assignments.labs.reset",
      )(function* (input) {
        const { user, context } = yield* resolveAssignmentContext({
          courseId: input.courseId,
          homeworkId: input.homeworkId,
          challengeIndex: input.challengeIndex,
          challengeId: input.challengeId,
          tabType: 1,
        });
        const raw = yield* educoder.Myshixun.resetRepository({
          params: {
            myshixunId: context.workspaceIdentifier,
          },
          query: {
            zzud: user.login,
          },
          payload: {
            challenge_id: context.challengeId,
            homework_common_id: input.homeworkId,
          },
        });

        return {
          raw,
          view: {
            reset: raw,
          },
        };
      });

      const pruneRepository: LabAssignmentFeatureShape["pruneRepository"] = Effect.fn(
        "features.assignments.labs.prune",
      )(function* (input) {
        const { user, context } = yield* resolveAssignmentContext({
          courseId: input.courseId,
          homeworkId: input.homeworkId,
          challengeIndex: input.challengeIndex,
          challengeId: input.challengeId,
          tabType: 1,
        });
        const raw = yield* educoder.Myshixun.versionRepositoryDelete({
          params: {
            myshixunId: String(context.workspaceId),
          },
          query: {
            zzud: user.login,
          },
        });

        return {
          raw,
          view: {
            prune: raw,
          },
        };
      });

      const buildRepositoryFile: LabAssignmentFeatureShape["buildRepositoryFile"] = Effect.fn(
        "features.assignments.labs.build",
      )(function* (input) {
        const { user, taskId, context } = yield* resolveAssignmentContext({
          courseId: input.courseId,
          homeworkId: input.homeworkId,
          challengeIndex: input.challengeIndex,
          challengeId: input.challengeId,
          envId: input.envId,
          tabType: input.tabType,
        });
        const raw = yield* triggerRepositoryBuild({
          taskId,
          homeworkId: input.homeworkId,
          secKey: input.secKey,
          resubmit: input.resubmit,
          commitId: input.commitId,
          contentModified: input.contentModified,
          context,
          user,
          tabType: input.tabType,
        });

        return {
          raw,
          view: {
            build: raw,
          },
        };
      });

      const getEvaluationStatus: LabAssignmentFeatureShape["getEvaluationStatus"] = Effect.fn(
        "features.assignments.labs.status",
      )(function* (input) {
        const { user, taskId, context } = yield* resolveAssignmentContext({
          courseId: input.courseId,
          homeworkId: input.homeworkId,
          challengeIndex: input.challengeIndex,
          challengeId: input.challengeId,
          tabType: 1,
        });
        const raw = yield* educoder.Task.gameStatus(
          makeStatusRequest({
            taskId,
            homeworkId: input.homeworkId,
            login: user.login,
            secKey: input.secKey,
            challengeId: context.challengeId,
            resubmit: input.resubmit,
            timeOut: input.timeOut,
            port: input.port,
            subjectId: input.subjectId,
          }),
        );

        return {
          raw,
          view: formatStatusResponse(raw),
        };
      });

      const evaluateRepositoryFile: LabAssignmentFeatureShape["evaluateRepositoryFile"] = Effect.fn(
        "features.assignments.labs.evaluate",
      )(function* (input) {
        const { user, taskId, context } = yield* resolveAssignmentContext({
          courseId: input.courseId,
          homeworkId: input.homeworkId,
          challengeIndex: input.challengeIndex,
          challengeId: input.challengeId,
          envId: input.envId,
          tabType: input.tabType,
        });
        const content =
          input.content ??
          decodeBase64(
            (yield* fetchRepositoryContent({
              taskId,
              homeworkId: input.homeworkId,
              path: input.path,
              exerciseId: "",
              login: user.login,
            })).content.content,
          );
        const save = yield* updateRepositoryFile({
          homeworkId: input.homeworkId,
          path: input.path,
          content,
          evaluate: true,
          context,
          user,
          tabType: input.tabType,
        });
        const secKey = save.sec_key ?? "";

        if (secKey.length === 0) {
          return yield* failInput("Educoder did not return sec_key for this evaluation.");
        }

        const build = yield* triggerRepositoryBuild({
          taskId,
          homeworkId: input.homeworkId,
          secKey,
          resubmit: save.resubmit ?? "",
          commitId: save.content.commitID,
          contentModified: save.content_modified,
          context,
          user,
          tabType: input.tabType,
        });
        const status = input.poll
          ? yield* pollGameStatus({
              taskId,
              homeworkId: input.homeworkId,
              login: user.login,
              secKey,
              challengeId: context.challengeId,
              resubmit: save.resubmit ?? "",
              timeOut: false,
              port: 0,
              subjectId: "",
              interval: input.pollInterval,
              limit: input.pollLimit,
              onRunning: input.onRunning,
            })
          : null;
        const raw = {
          save,
          build,
          status,
        };

        return {
          raw,
          view:
            status === null
              ? {
                  evaluate: {
                    path: input.path,
                    commitId: save.content.commitID,
                    secKey,
                    build,
                  },
                }
              : formatStatusResponse(status),
        };
      });

      const getLogs: LabAssignmentFeatureShape["getLogs"] = Effect.fn("features.assignments.labs.logs")(
        function* (input) {
          const { user, taskId, context } = yield* resolveAssignmentContext({
            courseId: input.courseId,
            homeworkId: input.homeworkId,
            challengeIndex: input.challengeIndex,
            challengeId: input.challengeId,
            envId: input.envId,
            tabType: input.tabType,
          });
          const raw = yield* educoder.Task.logOutput({
            params: {
              taskId,
            },
            query: {
              zzud: user.login,
            },
            payload: {
              shixun_environment_id: context.environmentId,
              tab_type: input.tabType,
              extras: {
                homework_common_id: input.homeworkId,
              },
            },
          });

          return {
            raw,
            view: {
              logs: raw,
            },
          };
        },
      );

      const commitFiles: LabAssignmentFeatureShape["commitFiles"] = Effect.fn("features.assignments.labs.commit")(
        function* (input) {
          const { user, taskId, context } = yield* resolveAssignmentContext({
            courseId: input.courseId,
            homeworkId: input.homeworkId,
            challengeIndex: input.challengeIndex,
            challengeId: input.challengeId,
            envId: input.envId,
            tabType: 1,
          });
          const raw = yield* educoder.Task.commitFiles({
            params: {
              taskId,
            },
            query: {
              shixun_environment_id: context.environmentId,
              zzud: user.login,
            },
          });

          return {
            raw,
            view: {
              commit: raw,
            },
          };
        },
      );

      const pullFiles: LabAssignmentFeatureShape["pullFiles"] = Effect.fn("features.assignments.labs.pull")(
        function* (input) {
          const { user, taskId, context } = yield* resolveAssignmentContext({
            courseId: input.courseId,
            homeworkId: input.homeworkId,
            challengeIndex: input.challengeIndex,
            challengeId: input.challengeId,
            envId: input.envId,
            tabType: 1,
          });
          const raw = yield* educoder.Task.pullFiles({
            params: {
              taskId,
            },
            query: {
              shixun_environment_id: context.environmentId,
              zzud: user.login,
            },
          });

          return {
            raw,
            view: {
              pull: raw,
            },
          };
        },
      );

      const getRemainingTime: LabAssignmentFeatureShape["getRemainingTime"] = Effect.fn(
        "features.assignments.labs.remainingTime",
      )(function* (input) {
        const { user, context } = yield* resolveAssignmentContext({
          courseId: input.courseId,
          homeworkId: input.homeworkId,
          challengeIndex: input.challengeIndex,
          challengeId: input.challengeId,
          tabType: 1,
        });
        const raw = yield* educoder.Myshixun.getRemainingTime({
          params: {
            myshixunId: context.workspaceIdentifier,
          },
          query: {
            zzud: user.login,
          },
        });

        return {
          raw,
          view: {
            remainingTime: raw.data.remainingTime,
          },
        };
      });

      const startSsh: LabAssignmentFeatureShape["startSsh"] = Effect.fn("features.assignments.labs.ssh")(
        function* (input) {
          const { user, context } = yield* resolveAssignmentContext({
            courseId: input.courseId,
            homeworkId: input.homeworkId,
            challengeIndex: input.challengeIndex,
            challengeId: input.challengeId,
            envId: input.envId,
            tabType: input.tabType,
          });
          const raw = yield* educoder.Myshixun.start({
            params: {
              myshixunId: context.workspaceIdentifier,
            },
            query: {
              shixun_environment_id: context.environmentId,
              tab_type: input.tabType,
              game_id: context.gameId,
              homework_common_id: input.homeworkId,
              zzud: user.login,
            },
          });
          const sshArgs = input.resolveArgs === false ? null : resolveSshArgs(raw);

          return {
            raw,
            view: {
              sshArgs,
            },
          };
        },
      );

      return LabAssignmentFeature.of({
        list,
        listChallenges,
        resolveTask,
        getTask,
        getLearningContent,
        getRepositoryContent,
        listRepository,
        saveRepositoryFile,
        getPassedCode,
        resetRepository,
        pruneRepository,
        buildRepositoryFile,
        getEvaluationStatus,
        evaluateRepositoryFile,
        getLogs,
        commitFiles,
        pullFiles,
        getRemainingTime,
        startSsh,
      });
    }),
  );
}

const parseLabIdentifier = (operation: ReadonlyArray<unknown> | null | undefined) => {
  const path = operation?.[1];

  if (typeof path !== "string") {
    return null;
  }

  return path.match(/\/shixuns\/([^/]+)\/shixun_exec/)?.[1] ?? null;
};

const collapseBlankLines = (value: string) =>
  value
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const normalizeLearningMarkdown = (value: string) =>
  value
    .replace(/\r\n?/g, "\n")
    .replace(/^([ \t]{0,3}#{1,6})(?=\S)/gm, "$1 ")
    .replace(/^\s*\[toc\]\s*$/gim, "")
    .replace(/^\s*-{3,}\s*$/gm, "");

const prependToc = (rendered: string, headings: ReadonlyArray<string>, hasToc: boolean) =>
  hasToc && headings.length >= 1
    ? collapseBlankLines(`${headings.join("\n")}\n\n${rendered}`)
    : collapseBlankLines(rendered);

const formatLearningContent = (markdown: string): LabLearningContentView["content"] => {
  const normalized = normalizeLearningMarkdown(markdown);
  const headings = parseMeta(normalized).headings.map((heading) => heading.text);
  const hasToc = /^\s*\[toc\]\s*$/im.test(markdown);

  return {
    markdown,
    ansi: prependToc(renderToAnsi(normalized), headings, hasToc),
    text: prependToc(renderToText(normalized), headings, hasToc),
    headings,
  };
};

const renderLearningContent = Effect.fn("features.assignments.labs.renderLearningContent")(function* (
  markdown: string,
) {
  yield* Effect.promise(() => initMarkdownRenderer());

  return formatLearningContent(markdown);
});

const formatChallengeList = (
  input: ListLabChallengesInput,
  homework: HomeworkInfoRaw,
  raw: LabChallengeDataRaw,
): LabChallengeListView => ({
  assignment: {
    courseId: input.courseId ?? String(homework.course_id),
    homeworkId: input.homeworkId,
    name: homework.homework_name,
    labIdentifier: homework.shixun_identifier ?? parseLabIdentifier(homework.task_operation),
  },
  summary: {
    score: raw.data.work_score,
    evaluateCount: raw.data.evaluate_count,
    timeConsuming: raw.data.time_consuming,
    passed: raw.data.passed_count,
    pending: raw.data.no_evaluate_count,
  },
  challenges: raw.data.challenge_settings.map((challenge, index) => ({
    index: index + 1,
    challengeId: challenge.challenge_id,
    name: challenge.challenge_name,
    score: challenge.challenge_score,
    status: challenge.status,
    difficulty: challenge.difficulty,
    passedStatus: challenge.passed_status,
    gameScore: challenge.game_score,
    evaluateCount: challenge.evaluate_count,
    timeConsuming: challenge.time_consuming,
    knowledgePoints: challenge.knowledge_points,
    operation: formatOperation(challenge.task_operation),
  })),
});

const formatResolvedTask = (
  input: LabTaskInput,
  taskId: string,
  taskInfo: TaskInfoRaw,
  selected: SelectedChallenge | null,
  homework: HomeworkInfoRaw | undefined,
): ResolveLabTaskView => ({
  taskId,
  homeworkId: input.homeworkId,
  courseId: input.courseId.length >= 1 ? input.courseId : null,
  labIdentifier: taskInfo.shixun?.identifier ?? homework?.shixun_identifier ?? null,
  challengeId: taskInfo.challenge.id ?? selected?.challengeId ?? null,
  challengeIndex: taskInfo.challenge.position ?? selected?.index ?? null,
  challengeName: taskInfo.challenge.subject ?? selected?.name ?? null,
});

const parsePort = (value: string) => {
  const port = Number.parseInt(value, 10);

  return Number.isInteger(port) && port >= 1 && port <= 65535 ? port : null;
};

const resolveSshArgs = (value: StartSshRaw) => {
  const port = parsePort(value.data.port);
  const target = `${value.data.username}@${value.data.ssh_address}`;

  return port === null ? [target] : ["-p", String(port), target];
};

const requiredString = (value: string | null | undefined, name: string) =>
  typeof value === "string" && value.length >= 1 ? Effect.succeed(value) : failInput(`Cannot read ${name}.`);

const requiredNumber = (value: number | null | undefined, name: string) =>
  typeof value === "number" && Number.isFinite(value) ? Effect.succeed(value) : failInput(`Cannot read ${name}.`);

const resolveEnvironmentId = Effect.fn("features.assignments.labs.resolveEnvironmentId")(function* (
  taskInfo: TaskInfoRaw,
  envId: number | undefined,
  tabType: number,
) {
  if (envId !== undefined) {
    return envId;
  }

  const codeEditorEnvironmentId = taskInfo.code_editor?.shixun_environment_id;

  if (tabType === 1 && codeEditorEnvironmentId != null) {
    return codeEditorEnvironmentId;
  }

  for (const environment of taskInfo.shixun_environments ?? []) {
    const candidateTabType = environment.tab_type;
    const candidateEnvironmentId = environment.shixun_environment_id;

    if (candidateTabType === tabType && candidateEnvironmentId != null) {
      return candidateEnvironmentId;
    }
  }

  for (const environment of taskInfo.shixun_environments ?? []) {
    const candidateEnvironmentId = environment.shixun_environment_id;

    if (candidateEnvironmentId != null) {
      return candidateEnvironmentId;
    }
  }

  return yield* failInput("Cannot infer lab environment id. Pass --env-id explicitly.");
});

const parseTaskContext = Effect.fn("features.assignments.labs.parseTaskContext")(function* (
  taskInfo: TaskInfoRaw,
  envId: number | undefined,
  tabType: number,
) {
  const environmentId = yield* resolveEnvironmentId(taskInfo, envId, tabType);

  return {
    gameId: yield* requiredNumber(taskInfo.game.id, "game.id"),
    challengeId: yield* requiredNumber(taskInfo.challenge.id, "challenge.id"),
    challengePath: yield* requiredString(taskInfo.challenge.path, "challenge.path"),
    workspaceId: yield* requiredNumber(taskInfo.myshixun.id ?? taskInfo.game.myshixun_id, "workspace.id"),
    workspaceIdentifier: yield* requiredString(taskInfo.myshixun.identifier, "workspace.identifier"),
    environmentId,
  } satisfies TaskContext;
});
