import { Context, Effect, Layer } from "effect";
import { AppContext } from "../../context/index.js";
import { EducoderApi } from "../../educoder-api/index.js";
import { type EducoderApiResponse, type FeatureWorkflow } from "../shared.js";
import {
  asArray,
  asRecord,
  decodeBase64,
  failInput,
  formatLabels,
  formatOperation,
  formatSaveResponse,
  formatStatusResponse,
  formatTaskInfo,
  HomeworkTypeCode,
  makeGameBuildPayload,
  makeStatusRequest,
  makeTaskQuery,
  makeUpdateFilePayload,
  numberField,
  stringField,
  type CurrentUser,
  type HomeworkSortBy,
  type HomeworkSortDirection,
  type TaskContext,
} from "./shared.js";

type ListShixunHomeworksInput = {
  readonly courseId: string;
  readonly category?: number | undefined;
  readonly status: number;
  readonly page: number;
  readonly limit: number;
  readonly order?: number | undefined;
  readonly search?: string | undefined;
  readonly sortBy?: HomeworkSortBy | undefined;
  readonly sortDirection?: HomeworkSortDirection | undefined;
};

type ShixunTaskInput = {
  readonly taskId: string;
  readonly homeworkId: string;
};

type ShixunRepositoryContentInput = {
  readonly taskId: string;
  readonly path: string;
  readonly homeworkId: string;
  readonly exerciseId: string;
};

type ListShixunRepositoryInput = {
  readonly taskId: string;
  readonly homeworkId: string;
  readonly path?: string | undefined;
};

type SaveShixunRepositoryFileInput = {
  readonly taskId: string;
  readonly path: string;
  readonly homeworkId: string;
  readonly content: string;
  readonly evaluate: boolean;
  readonly envId?: number | undefined;
  readonly tabType: number;
};

type ShixunTaskWithHomeworkInput = {
  readonly taskId: string;
  readonly homeworkId: string;
};

type ShixunTaskWithPathInput = {
  readonly taskId: string;
  readonly path: string;
};

type BuildShixunRepositoryFileInput = {
  readonly taskId: string;
  readonly homeworkId: string;
  readonly secKey: string;
  readonly commitId: string;
  readonly contentModified: number;
  readonly resubmit: string;
  readonly envId?: number | undefined;
  readonly tabType: number;
};

type ShixunEvaluationStatusInput = {
  readonly taskId: string;
  readonly homeworkId: string;
  readonly secKey: string;
  readonly resubmit: string;
  readonly timeOut: boolean;
  readonly port: number;
  readonly subjectId: string;
};

type EvaluateShixunRepositoryFileInput = {
  readonly taskId: string;
  readonly path: string;
  readonly homeworkId: string;
  readonly content: string;
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

type ShixunLogsInput = {
  readonly taskId: string;
  readonly homeworkId: string;
  readonly envId?: number | undefined;
  readonly tabType: number;
};

type ShixunEnvironmentInput = {
  readonly taskId: string;
  readonly homeworkId: string;
  readonly envId?: number | undefined;
};

type StartShixunSshInput = {
  readonly taskId: string;
  readonly homeworkId: string;
  readonly envId?: number | undefined;
  readonly tabType: number;
  readonly resolveArgs?: boolean | undefined;
};

type HomeworkCommonsRaw = EducoderApiResponse<"Course", "homeworkCommons">;
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

type ListShixunHomeworksView = {
  readonly total: number;
  readonly filters: {
    readonly status: number;
    readonly order: number;
    readonly search: string | null;
    readonly sortBy: HomeworkSortBy | null;
    readonly sortDirection: HomeworkSortDirection | null;
  };
  readonly category: {
    readonly id: number | null;
    readonly name: string;
    readonly total: number;
    readonly published: number;
    readonly unpublished: number;
  };
  readonly homeworks: Record<
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
      readonly shixunIdentifier: string | null;
      readonly myshixunIdentifier: string | null;
      readonly progress: {
        readonly finished: number | null;
        readonly checked: number | null;
        readonly total: number | null;
      };
      readonly operation: ReturnType<typeof formatOperation>;
      readonly shixunStatus: number | null;
    }
  >;
};

type ShixunTaskView = ReturnType<typeof formatTaskInfo>;
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
type SaveShixunFileView = {
  readonly saved: ReturnType<typeof formatSaveResponse>;
};
type ResetShixunRepositoryView = {
  readonly reset: ResetRepositoryRaw;
};
type PruneShixunRepositoryView = {
  readonly prune: VersionRepositoryDeleteRaw;
};
type BuildShixunRepositoryFileView = {
  readonly build: GameBuildRaw;
};
type ShixunEvaluationStatusView = ReturnType<typeof formatStatusResponse>;
type EvaluateShixunRepositoryFileRaw = {
  readonly save: UpdateFileRaw;
  readonly build: GameBuildRaw;
  readonly status: GameStatusRaw | null;
};
type EvaluateShixunRepositoryFileView =
  | ShixunEvaluationStatusView
  | {
      readonly evaluate: {
        readonly path: string;
        readonly commitId: string;
        readonly secKey: string;
        readonly build: GameBuildRaw;
      };
    };
type ShixunLogsView = {
  readonly logs: LogOutputRaw;
};
type SimpleTaskView<Key extends string> = Record<Key, SimpleTaskRaw>;
type RemainingTimeView = {
  readonly remainingTime: number;
};
type StartSshView = {
  readonly sshArgs: ReadonlyArray<string> | null;
};

export type HomeworkShixunFeatureShape = {
  readonly list: FeatureWorkflow<ListShixunHomeworksInput, HomeworkCommonsRaw, ListShixunHomeworksView>;
  readonly getTask: FeatureWorkflow<ShixunTaskInput, TaskInfoRaw, ShixunTaskView>;
  readonly getRepositoryContent: FeatureWorkflow<
    ShixunRepositoryContentInput,
    RepositoryContentRaw,
    RepositoryContentView
  >;
  readonly listRepository: FeatureWorkflow<ListShixunRepositoryInput, RepositoryRaw, RepositoryView>;
  readonly saveRepositoryFile: FeatureWorkflow<SaveShixunRepositoryFileInput, UpdateFileRaw, SaveShixunFileView>;
  readonly getPassedCode: FeatureWorkflow<ShixunTaskWithPathInput, ResetPassedCodeRaw, ResetPassedCodeRaw>;
  readonly resetRepository: FeatureWorkflow<ShixunTaskWithHomeworkInput, ResetRepositoryRaw, ResetShixunRepositoryView>;
  readonly pruneRepository: FeatureWorkflow<
    ShixunTaskWithHomeworkInput,
    VersionRepositoryDeleteRaw,
    PruneShixunRepositoryView
  >;
  readonly buildRepositoryFile: FeatureWorkflow<
    BuildShixunRepositoryFileInput,
    GameBuildRaw,
    BuildShixunRepositoryFileView
  >;
  readonly getEvaluationStatus: FeatureWorkflow<ShixunEvaluationStatusInput, GameStatusRaw, ShixunEvaluationStatusView>;
  readonly evaluateRepositoryFile: FeatureWorkflow<
    EvaluateShixunRepositoryFileInput,
    EvaluateShixunRepositoryFileRaw,
    EvaluateShixunRepositoryFileView
  >;
  readonly getLogs: FeatureWorkflow<ShixunLogsInput, LogOutputRaw, ShixunLogsView>;
  readonly commitFiles: FeatureWorkflow<ShixunEnvironmentInput, SimpleTaskRaw, SimpleTaskView<"commit">>;
  readonly pullFiles: FeatureWorkflow<ShixunEnvironmentInput, SimpleTaskRaw, SimpleTaskView<"pull">>;
  readonly getRemainingTime: FeatureWorkflow<ShixunTaskWithHomeworkInput, RemainingTimeRaw, RemainingTimeView>;
  readonly startSsh: FeatureWorkflow<StartShixunSshInput, StartSshRaw, StartSshView>;
};

export class HomeworkShixunFeature extends Context.Service<HomeworkShixunFeature, HomeworkShixunFeatureShape>()(
  "open-educoder/services/features/HomeworkShixunFeature",
) {
  public static readonly layer = Layer.effect(
    HomeworkShixunFeature,
    Effect.gen(function* () {
      const ctx = yield* AppContext;
      const educoder = yield* EducoderApi;

      const resolveCurrentUser = Effect.fn("features.homework.shixun.resolveCurrentUser")(function* () {
        const user = yield* ctx.user;

        return {
          login: user.login,
          userId: user.user_id,
        } satisfies CurrentUser;
      });

      const resolveLogin = Effect.fn("features.homework.shixun.resolveLogin")(function* () {
        const user = yield* resolveCurrentUser();

        return user.login;
      });

      const fetchTaskInfo = Effect.fn("features.homework.shixun.fetchTaskInfo")(function* (input: {
        readonly taskId: string;
        readonly homeworkId: string;
        readonly login: string;
      }) {
        return yield* educoder.Task.info(makeTaskQuery(input.taskId, input.homeworkId, input.login));
      });

      const resolveHomeworkContext = Effect.fn("features.homework.shixun.resolveHomeworkContext")(function* (input: {
        readonly taskId: string;
        readonly homeworkId: string;
        readonly envId?: number | undefined;
        readonly tabType: number;
      }) {
        const user = yield* resolveCurrentUser();
        const taskInfo = yield* fetchTaskInfo({
          taskId: input.taskId,
          homeworkId: input.homeworkId,
          login: user.login,
        });
        const context = yield* parseTaskContext(taskInfo, input.envId, input.tabType);

        return {
          user,
          context,
        };
      });

      const fetchRepositoryContent = Effect.fn("features.homework.shixun.fetchRepositoryContent")(function* (input: {
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

      const updateRepositoryFile = Effect.fn("features.homework.shixun.updateRepositoryFile")(function* (input: {
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
            myshixunId: input.context.myshixunIdentifier,
          },
          query: {
            zzud: input.user.login,
          },
          payload: makeUpdateFilePayload(input),
        });
      });

      const triggerRepositoryBuild = Effect.fn("features.homework.shixun.triggerRepositoryBuild")(function* (input: {
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

      const pollGameStatus = Effect.fn("features.homework.shixun.pollGameStatus")(function* (input: {
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

      const list: HomeworkShixunFeatureShape["list"] = Effect.fn("features.homework.shixun.list")(function* (input) {
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
            type: HomeworkTypeCode.shixun,
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
            homeworks: Object.fromEntries(
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
                    shixunIdentifier: item.shixun_identifier ?? null,
                    myshixunIdentifier: item.myshixun_identifier ?? null,
                    progress: {
                      finished: item.finished_challenge_count ?? null,
                      checked: item.checked_challenge_count ?? null,
                      total: item.challenge_count ?? null,
                    },
                    operation: formatOperation(item.task_operation),
                    shixunStatus: item.shixun_finished_status ?? null,
                  },
                ];
              }),
            ),
          },
        };
      });

      const getTask: HomeworkShixunFeatureShape["getTask"] = Effect.fn("features.homework.shixun.task")(
        function* (input) {
          const login = yield* resolveLogin();
          const raw = yield* fetchTaskInfo({
            taskId: input.taskId,
            homeworkId: input.homeworkId,
            login,
          });

          return {
            raw,
            view: formatTaskInfo(raw),
          };
        },
      );

      const getRepositoryContent: HomeworkShixunFeatureShape["getRepositoryContent"] = Effect.fn(
        "features.homework.shixun.content",
      )(function* (input) {
        const login = yield* resolveLogin();
        const raw = yield* fetchRepositoryContent({
          taskId: input.taskId,
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

      const listRepository: HomeworkShixunFeatureShape["listRepository"] = Effect.fn(
        "features.homework.shixun.repository",
      )(function* (input) {
        const { user, context } = yield* resolveHomeworkContext({
          taskId: input.taskId,
          homeworkId: input.homeworkId,
          tabType: 1,
        });
        const path = input.path ?? "";
        const raw = yield* educoder.Myshixun.repository({
          params: {
            myshixunId: context.myshixunIdentifier,
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

      const saveRepositoryFile: HomeworkShixunFeatureShape["saveRepositoryFile"] = Effect.fn(
        "features.homework.shixun.save",
      )(function* (input) {
        const { user, context } = yield* resolveHomeworkContext({
          taskId: input.taskId,
          homeworkId: input.homeworkId,
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

      const getPassedCode: HomeworkShixunFeatureShape["getPassedCode"] = Effect.fn("features.homework.shixun.passed")(
        function* (input) {
          const login = yield* resolveLogin();
          const raw = yield* educoder.Task.resetPassedCode({
            params: {
              taskId: input.taskId,
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

      const resetRepository: HomeworkShixunFeatureShape["resetRepository"] = Effect.fn(
        "features.homework.shixun.reset",
      )(function* (input) {
        const { user, context } = yield* resolveHomeworkContext({
          taskId: input.taskId,
          homeworkId: input.homeworkId,
          tabType: 1,
        });
        const raw = yield* educoder.Myshixun.resetRepository({
          params: {
            myshixunId: context.myshixunIdentifier,
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

      const pruneRepository: HomeworkShixunFeatureShape["pruneRepository"] = Effect.fn(
        "features.homework.shixun.prune",
      )(function* (input) {
        const { user, context } = yield* resolveHomeworkContext({
          taskId: input.taskId,
          homeworkId: input.homeworkId,
          tabType: 1,
        });
        const raw = yield* educoder.Myshixun.versionRepositoryDelete({
          params: {
            myshixunId: String(context.myshixunId),
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

      const buildRepositoryFile: HomeworkShixunFeatureShape["buildRepositoryFile"] = Effect.fn(
        "features.homework.shixun.build",
      )(function* (input) {
        const { user, context } = yield* resolveHomeworkContext({
          taskId: input.taskId,
          homeworkId: input.homeworkId,
          envId: input.envId,
          tabType: input.tabType,
        });
        const raw = yield* triggerRepositoryBuild({
          taskId: input.taskId,
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

      const getEvaluationStatus: HomeworkShixunFeatureShape["getEvaluationStatus"] = Effect.fn(
        "features.homework.shixun.status",
      )(function* (input) {
        const { user, context } = yield* resolveHomeworkContext({
          taskId: input.taskId,
          homeworkId: input.homeworkId,
          tabType: 1,
        });
        const raw = yield* educoder.Task.gameStatus(
          makeStatusRequest({
            taskId: input.taskId,
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

      const evaluateRepositoryFile: HomeworkShixunFeatureShape["evaluateRepositoryFile"] = Effect.fn(
        "features.homework.shixun.evaluate",
      )(function* (input) {
        const { user, context } = yield* resolveHomeworkContext({
          taskId: input.taskId,
          homeworkId: input.homeworkId,
          envId: input.envId,
          tabType: input.tabType,
        });
        const save = yield* updateRepositoryFile({
          homeworkId: input.homeworkId,
          path: input.path,
          content: input.content,
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
          taskId: input.taskId,
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
              taskId: input.taskId,
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

      const getLogs: HomeworkShixunFeatureShape["getLogs"] = Effect.fn("features.homework.shixun.logs")(
        function* (input) {
          const { user, context } = yield* resolveHomeworkContext({
            taskId: input.taskId,
            homeworkId: input.homeworkId,
            envId: input.envId,
            tabType: input.tabType,
          });
          const raw = yield* educoder.Task.logOutput({
            params: {
              taskId: input.taskId,
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

      const commitFiles: HomeworkShixunFeatureShape["commitFiles"] = Effect.fn("features.homework.shixun.commit")(
        function* (input) {
          const { user, context } = yield* resolveHomeworkContext({
            taskId: input.taskId,
            homeworkId: input.homeworkId,
            envId: input.envId,
            tabType: 1,
          });
          const raw = yield* educoder.Task.commitFiles({
            params: {
              taskId: input.taskId,
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

      const pullFiles: HomeworkShixunFeatureShape["pullFiles"] = Effect.fn("features.homework.shixun.pull")(
        function* (input) {
          const { user, context } = yield* resolveHomeworkContext({
            taskId: input.taskId,
            homeworkId: input.homeworkId,
            envId: input.envId,
            tabType: 1,
          });
          const raw = yield* educoder.Task.pullFiles({
            params: {
              taskId: input.taskId,
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

      const getRemainingTime: HomeworkShixunFeatureShape["getRemainingTime"] = Effect.fn(
        "features.homework.shixun.remainingTime",
      )(function* (input) {
        const { user, context } = yield* resolveHomeworkContext({
          taskId: input.taskId,
          homeworkId: input.homeworkId,
          tabType: 1,
        });
        const raw = yield* educoder.Myshixun.getRemainingTime({
          params: {
            myshixunId: context.myshixunIdentifier,
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

      const startSsh: HomeworkShixunFeatureShape["startSsh"] = Effect.fn("features.homework.shixun.ssh")(
        function* (input) {
          const { user, context } = yield* resolveHomeworkContext({
            taskId: input.taskId,
            homeworkId: input.homeworkId,
            envId: input.envId,
            tabType: input.tabType,
          });
          const raw = yield* educoder.Myshixun.start({
            params: {
              myshixunId: context.myshixunIdentifier,
            },
            query: {
              shixun_environment_id: context.environmentId,
              tab_type: input.tabType,
              game_id: context.gameId,
              homework_common_id: input.homeworkId,
              zzud: user.login,
            },
          });
          const sshArgs = input.resolveArgs === false ? null : yield* resolveSshArgs(raw);

          return {
            raw,
            view: {
              sshArgs,
            },
          };
        },
      );

      return HomeworkShixunFeature.of({
        list,
        getTask,
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

const parsePort = (value: unknown) => {
  const port = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;

  return Number.isInteger(port) && port >= 1 && port <= 65535 ? port : null;
};

const resolveSshArgs = (value: unknown) => {
  const root = asRecord(value);
  const data = asRecord(root?.["data"]) ?? root;
  const host = stringField(data, "ssh_address") ?? stringField(data, "sshAddress") ?? stringField(data, "host");
  const user = stringField(data, "username") ?? stringField(data, "user") ?? stringField(data, "login");
  const port = parsePort(data?.["port"]);

  if (host === null) {
    return failInput("Cannot infer SSH target from terminal start response. Re-run with --json to inspect it.");
  }

  const target = user === null ? host : `${user}@${host}`;

  return Effect.succeed(port === null ? [target] : ["-p", String(port), target]);
};

const requiredRecord = (value: unknown, name: string) => {
  const record = asRecord(value);

  return record !== null ? Effect.succeed(record) : failInput(`Cannot read ${name} from task response.`);
};

const requiredString = (value: unknown, name: string) =>
  typeof value === "string" && value.length >= 1 ? Effect.succeed(value) : failInput(`Cannot read ${name}.`);

const requiredNumber = (value: unknown, name: string) =>
  typeof value === "number" && Number.isFinite(value) ? Effect.succeed(value) : failInput(`Cannot read ${name}.`);

const resolveEnvironmentId = Effect.fn("features.homework.shixun.resolveEnvironmentId")(function* (
  taskInfo: TaskInfoRaw,
  envId: number | undefined,
  tabType: number,
) {
  if (envId !== undefined) {
    return envId;
  }

  const root = yield* requiredRecord(taskInfo, "root");
  const codeEditor = asRecord(root["code_editor"]);
  const codeEditorEnvironmentId = numberField(codeEditor, "shixun_environment_id");

  if (tabType === 1 && codeEditorEnvironmentId !== null) {
    return codeEditorEnvironmentId;
  }

  for (const environment of asArray(root["shixun_environments"])) {
    const record = asRecord(environment);
    const candidateTabType = numberField(record, "tab_type");
    const candidateEnvironmentId = numberField(record, "shixun_environment_id");

    if (candidateTabType === tabType && candidateEnvironmentId !== null) {
      return candidateEnvironmentId;
    }
  }

  for (const environment of asArray(root["shixun_environments"])) {
    const record = asRecord(environment);
    const candidateEnvironmentId = numberField(record, "shixun_environment_id");

    if (candidateEnvironmentId !== null) {
      return candidateEnvironmentId;
    }
  }

  return yield* failInput("Cannot infer shixun environment id. Pass --env-id explicitly.");
});

const parseTaskContext = Effect.fn("features.homework.shixun.parseTaskContext")(function* (
  taskInfo: TaskInfoRaw,
  envId: number | undefined,
  tabType: number,
) {
  const root = yield* requiredRecord(taskInfo, "root");
  const game = yield* requiredRecord(root["game"], "game");
  const challenge = yield* requiredRecord(root["challenge"], "challenge");
  const myshixun = yield* requiredRecord(root["myshixun"], "myshixun");
  const environmentId = yield* resolveEnvironmentId(taskInfo, envId, tabType);

  return {
    gameId: yield* requiredNumber(game["id"], "game.id"),
    challengeId: yield* requiredNumber(challenge["id"], "challenge.id"),
    challengePath: yield* requiredString(challenge["path"], "challenge.path"),
    myshixunId: yield* requiredNumber(myshixun["id"] ?? game["myshixun_id"], "myshixun.id"),
    myshixunIdentifier: yield* requiredString(myshixun["identifier"], "myshixun.identifier"),
    environmentId,
  } satisfies TaskContext;
});

const isRunningStatusResponse = (value: GameStatusRaw) => numberField(asRecord(value), "running_code_status") !== null;
