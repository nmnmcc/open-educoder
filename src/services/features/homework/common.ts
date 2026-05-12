import { Context, Effect, Layer } from "effect";

import { AppContext } from "../../context/index.js";
import { EducoderApi } from "../../educoder-api/index.js";
import { type EducoderApiResponse, type FeatureWorkflow } from "../shared.js";
import {
  type HomeworkSortBy,
  type HomeworkSortDirection,
  HomeworkTypeCode,
  asArray,
  asRecord,
  booleanField,
  formatLabels,
  numberField,
  stringField,
} from "./shared.js";

const resolveCategoryId = (homeworkId: string, categoryId?: string | undefined) => categoryId ?? homeworkId;

const stringArray = (value: unknown): ReadonlyArray<string> =>
  asArray(value).filter((item): item is string => typeof item === "string");

const labelsField = (record: Record<string, unknown> | null, key: string) => {
  const labels = stringArray(record?.[key]);

  return labels.length >= 1 ? formatLabels(labels) : null;
};

const jsonField = (record: Record<string, unknown> | null, key: string) => record?.[key] ?? null;

const arrayCount = (value: unknown) => (Array.isArray(value) ? value.length : null);

const formatBaseHomework = (value: unknown) => {
  const root = asRecord(value);
  const category = asRecord(root?.["category"]);

  return {
    id: numberField(root, "homework_id"),
    name: stringField(root, "homework_name"),
    type: stringField(root, "homework_type"),
    course: {
      id: numberField(root, "course_id"),
      name: stringField(root, "course_name"),
      ended: booleanField(root, "is_end"),
      endDate: stringField(root, "course_end_date"),
    },
    category:
      category === null
        ? null
        : {
            id: numberField(category, "category_id"),
            name: stringField(category, "category_name"),
            main: numberField(category, "main"),
          },
    status: labelsField(root, "homework_status"),
    timeStatus: numberField(root, "time_status"),
    openEvaluate: jsonField(root, "open_evaluate"),
  };
};

const formatAttachments = (value: unknown) =>
  Object.fromEntries(
    asArray(value).map((attachment, index) => {
      const record = asRecord(attachment);
      const id = numberField(record, "id") ?? index + 1;

      return [
        id,
        {
          title: stringField(record, "title"),
          size: stringField(record, "filesize"),
          type: stringField(record, "file_type"),
          subtype: stringField(record, "file_sub"),
          pdf: booleanField(record, "is_pdf"),
          editable: booleanField(record, "is_edit"),
          url: stringField(record, "download_url") ?? stringField(record, "url"),
        },
      ];
    }),
  );

const formatInfoResponse = (value: unknown) => {
  const root = asRecord(value);

  return {
    homework: {
      ...formatBaseHomework(value),
      workId: numberField(root, "work_id"),
      workStatus: labelsField(root, "work_statuses"),
      canSubmit: booleanField(root, "can_submit"),
      answerPublic: booleanField(root, "answer_public"),
      viewAnswer: booleanField(root, "view_answer"),
      description: stringField(root, "description"),
      submit: {
        size: numberField(root, "submit_size"),
        limit: booleanField(root, "submit_limit"),
        limitNum: numberField(root, "submit_limit_num"),
        mustFile: booleanField(root, "must_file"),
      },
      attachments: formatAttachments(root?.["attachments"]),
    },
  };
};

const formatWorksResponse = (value: unknown) => {
  const root = asRecord(value);
  const leftTime = asRecord(root?.["left_time"]);

  return {
    homework: formatBaseHomework(value),
    work: {
      id: numberField(root, "work_id") ?? numberField(root, "id"),
      status: numberField(root, "work_status"),
      updateTime: jsonField(root, "update_time"),
      scores: {
        work: jsonField(root, "work_score"),
        final: jsonField(root, "final_score"),
        teacher: jsonField(root, "teacher_score"),
        student: jsonField(root, "student_score"),
        assistant: jsonField(root, "teaching_asistant_score"),
        groupLeader: jsonField(root, "group_leader_score"),
      },
      submit: {
        canSubmit: booleanField(root, "can_submit"),
        submitNum: numberField(root, "submit_num"),
        submitCount: numberField(root, "submit_count"),
        redoCount: numberField(root, "redo_count"),
        size: numberField(root, "submit_size"),
        commitCount: numberField(root, "commit_count"),
        uncommitCount: numberField(root, "uncommit_count"),
        leftTime:
          leftTime === null
            ? null
            : {
                status: stringField(leftTime, "status"),
                time: stringField(leftTime, "time"),
              },
      },
      user: {
        login: stringField(root, "user_login"),
        name: stringField(root, "user_name"),
        studentId: stringField(root, "student_id"),
        group: stringField(root, "group_name"),
      },
      taCommentCount: numberField(root, "ta_comment_count"),
      groupData: jsonField(root, "group_data"),
      studentWorksCount: arrayCount(root?.["student_works"]),
    },
  };
};

const formatMember = (value: unknown) => {
  const member = asRecord(value);

  return {
    name: stringField(member, "user_name"),
    studentId: stringField(member, "student_id"),
    group: stringField(member, "group_name"),
    committed: booleanField(member, "commit_status"),
    team: booleanField(member, "is_team"),
  };
};

const formatSettingsResponse = (value: unknown) => {
  const root = asRecord(value);

  return {
    homework: formatBaseHomework(value),
    schedule: {
      publishTime: stringField(root, "publish_time"),
      endTime: stringField(root, "end_time"),
      lateTime: stringField(root, "late_time"),
      allowLate: booleanField(root, "allow_late"),
      latePenalty: jsonField(root, "late_penalty"),
    },
    submit: {
      canSubmit: booleanField(root, "can_submit"),
      canMakeUp: booleanField(root, "can_make_up"),
      submitNum: numberField(root, "submit_num"),
      submitSize: numberField(root, "submit_size"),
      limit: booleanField(root, "submit_limit"),
      limitNum: numberField(root, "submit_limit_num"),
      mustFile: booleanField(root, "must_file"),
    },
    score: {
      total: numberField(root, "total_score"),
      open: booleanField(root, "score_open"),
      workPublic: booleanField(root, "work_public"),
      answerPublic: booleanField(root, "answer_public"),
      commentPublic: booleanField(root, "comment_public"),
      details: asArray(root?.["score_details"]),
    },
    groups: {
      allUsers: numberField(root, "all_user_size"),
      settingsCount: arrayCount(root?.["group_settings"]),
      allowLateSettingsCount: arrayCount(root?.["allow_late_settings"]),
    },
    anonymous: {
      comment: booleanField(root, "anonymous_comment"),
      appeal: booleanField(root, "anonymous_appeal"),
    },
    canEdit: booleanField(root, "can_edit"),
    studentWorks: jsonField(root, "student_works"),
  };
};

type ListCommonHomeworksInput = {
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

type HomeworkIdInput = {
  readonly homeworkId: string;
};

type CommonHomeworkWithCourseInput = {
  readonly courseId: string;
  readonly homeworkId: string;
  readonly categoryId?: string | undefined;
};

type CommonHomeworkDraftInput = {
  readonly courseId: string;
  readonly homeworkId: string;
  readonly type: number;
};

type SearchCommonHomeworkMembersInput = {
  readonly courseId: string;
  readonly homeworkId: string;
  readonly page: number;
  readonly limit: number;
  readonly search: string;
};

type CommonHomeworkCommentsInput = {
  readonly courseId: string;
  readonly homeworkId: string;
  readonly categoryId?: string | undefined;
  readonly pageSize: number;
};

type CommonHomeworkRedoLogsInput = {
  readonly homeworkId: string;
  readonly type: number;
  readonly page: number;
  readonly limit: number;
};

type HomeworkCommonsRaw = EducoderApiResponse<"Course", "homeworkCommons">;
type CommonHomeworkInfoRaw = EducoderApiResponse<"HomeworkCommon", "info">;
type CommonHomeworkWorksRaw = EducoderApiResponse<"HomeworkCommon", "worksList">;
type CommonHomeworkDraftRaw = EducoderApiResponse<"HomeworkCommon", "studentWorkNew">;
type CommonHomeworkMembersRaw = EducoderApiResponse<"HomeworkCommon", "searchMemberList">;
type CommonHomeworkCommentsRaw = EducoderApiResponse<"HomeworkCommon", "showComment">;
type CommonHomeworkSettingsRaw = EducoderApiResponse<"HomeworkCommon", "settings">;
type CommonHomeworkRedoLogsRaw = EducoderApiResponse<"HomeworkCommon", "redoLogs">;

type ListCommonHomeworksView = {
  readonly total: number;
  readonly order: ReadonlyArray<string>;
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
      readonly workId: number | null;
      readonly workStatus: string | null;
      readonly uncommitted: boolean | null;
      readonly labStatus: string | null;
    }
  >;
};

type CommonHomeworkInfoView = ReturnType<typeof formatInfoResponse>;
type CommonHomeworkWorksView = ReturnType<typeof formatWorksResponse>;
type CommonHomeworkDraftView = {
  readonly draft: ReturnType<typeof formatBaseHomework>;
};
type CommonHomeworkMembersView = {
  readonly ai: boolean;
  readonly members: Record<string, ReturnType<typeof formatMember>>;
};
type CommonHomeworkCommentsView = {
  readonly comments: {
    readonly homeworkUserId: number;
    readonly messagesCount: number;
    readonly parentMessagesCount: number;
    readonly items: CommonHomeworkCommentsRaw["comments"];
  };
};
type CommonHomeworkSettingsView = ReturnType<typeof formatSettingsResponse>;
type CommonHomeworkRedoLogsView = {
  readonly redoLogs: {
    readonly status: number;
    readonly message: string;
    readonly homeworkType: string | undefined;
    readonly count: number | undefined;
    readonly list: ReadonlyArray<unknown>;
  };
};

export type HomeworkCommonFeatureShape = {
  readonly list: FeatureWorkflow<ListCommonHomeworksInput, HomeworkCommonsRaw, ListCommonHomeworksView>;
  readonly getInfo: FeatureWorkflow<HomeworkIdInput, CommonHomeworkInfoRaw, CommonHomeworkInfoView>;
  readonly getWorks: FeatureWorkflow<CommonHomeworkWithCourseInput, CommonHomeworkWorksRaw, CommonHomeworkWorksView>;
  readonly getDraft: FeatureWorkflow<CommonHomeworkDraftInput, CommonHomeworkDraftRaw, CommonHomeworkDraftView>;
  readonly searchMembers: FeatureWorkflow<
    SearchCommonHomeworkMembersInput,
    CommonHomeworkMembersRaw,
    CommonHomeworkMembersView
  >;
  readonly getComments: FeatureWorkflow<
    CommonHomeworkCommentsInput,
    CommonHomeworkCommentsRaw,
    CommonHomeworkCommentsView
  >;
  readonly getSettings: FeatureWorkflow<
    CommonHomeworkWithCourseInput,
    CommonHomeworkSettingsRaw,
    CommonHomeworkSettingsView
  >;
  readonly getRedoLogs: FeatureWorkflow<
    CommonHomeworkRedoLogsInput,
    CommonHomeworkRedoLogsRaw,
    CommonHomeworkRedoLogsView
  >;
};

export class HomeworkCommonFeature extends Context.Service<HomeworkCommonFeature, HomeworkCommonFeatureShape>()(
  "open-educoder/services/features/HomeworkCommonFeature",
) {
  public static readonly layer = Layer.effect(
    HomeworkCommonFeature,
    Effect.gen(function* () {
      const ctx = yield* AppContext;
      const educoder = yield* EducoderApi;

      const resolveLogin = Effect.fn("features.homework.common.resolveLogin")(function* () {
        const user = yield* ctx.user;

        return user.login;
      });

      const list: HomeworkCommonFeatureShape["list"] = Effect.fn("features.homework.common.list")(function* (input) {
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
            type: HomeworkTypeCode.common,
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
            homeworks: Object.fromEntries(
              raw.homeworks.map((item) => [
                item.homework_id,
                {
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
                  workId: item.work_id ?? null,
                  workStatus: item.work_status === undefined ? null : formatLabels(item.work_status),
                  uncommitted: item.un_commit_work ?? null,
                  labStatus: item.lab_status ?? null,
                },
              ]),
            ),
          },
        };
      });

      const getInfo: HomeworkCommonFeatureShape["getInfo"] = Effect.fn("features.homework.common.info")(
        function* (input) {
          const login = yield* resolveLogin();
          const raw = yield* educoder.HomeworkCommon.info({
            params: {
              homeworkId: input.homeworkId,
            },
            query: {
              zzud: login,
            },
          });

          return {
            raw,
            view: formatInfoResponse(raw),
          };
        },
      );

      const getWorks: HomeworkCommonFeatureShape["getWorks"] = Effect.fn("features.homework.common.works")(
        function* (input) {
          const login = yield* resolveLogin();
          const categoryId = resolveCategoryId(input.homeworkId, input.categoryId);
          const raw = yield* educoder.HomeworkCommon.worksList({
            params: {
              homeworkId: input.homeworkId,
            },
            query: {
              zzud: login,
            },
            payload: {
              coursesId: input.courseId,
              categoryId,
            },
          });

          return {
            raw,
            view: formatWorksResponse(raw),
          };
        },
      );

      const getDraft: HomeworkCommonFeatureShape["getDraft"] = Effect.fn("features.homework.common.draft")(
        function* (input) {
          const login = yield* resolveLogin();
          const raw = yield* educoder.HomeworkCommon.studentWorkNew({
            params: {
              homeworkId: input.homeworkId,
            },
            query: {
              coursesId: input.courseId,
              commonHomeworkId: input.homeworkId,
              type: input.type,
              zzud: login,
            },
          });

          return {
            raw,
            view: {
              draft: formatBaseHomework(raw),
            },
          };
        },
      );

      const searchMembers: HomeworkCommonFeatureShape["searchMembers"] = Effect.fn("features.homework.common.members")(
        function* (input) {
          const login = yield* resolveLogin();
          const raw = yield* educoder.HomeworkCommon.searchMemberList({
            params: {
              homeworkId: input.homeworkId,
            },
            query: {
              coursesId: input.courseId,
              commonHomeworkId: input.homeworkId,
              page: input.page,
              limit: input.limit,
              search: input.search,
              zzud: login,
            },
          });

          return {
            raw,
            view: {
              ai: raw.is_ai,
              members: Object.fromEntries(
                raw.members.map((member, index) => {
                  const record = asRecord(member);
                  const id = numberField(record, "user_id") ?? index + 1;

                  return [id, formatMember(member)];
                }),
              ),
            },
          };
        },
      );

      const getComments: HomeworkCommonFeatureShape["getComments"] = Effect.fn("features.homework.common.comments")(
        function* (input) {
          const login = yield* resolveLogin();
          const categoryId = resolveCategoryId(input.homeworkId, input.categoryId);
          const raw = yield* educoder.HomeworkCommon.showComment({
            params: {
              homeworkId: input.homeworkId,
            },
            query: {
              coursesId: input.courseId,
              categoryId,
              page_size: input.pageSize,
              zzud: login,
            },
          });

          return {
            raw,
            view: {
              comments: {
                homeworkUserId: raw.homework_user_id,
                messagesCount: raw.messages_count,
                parentMessagesCount: raw.parent_messages_count,
                items: raw.comments,
              },
            },
          };
        },
      );

      const getSettings: HomeworkCommonFeatureShape["getSettings"] = Effect.fn("features.homework.common.settings")(
        function* (input) {
          const login = yield* resolveLogin();
          const categoryId = resolveCategoryId(input.homeworkId, input.categoryId);
          const raw = yield* educoder.HomeworkCommon.settings({
            params: {
              homeworkId: input.homeworkId,
            },
            query: {
              coursesId: input.courseId,
              categoryId,
              zzud: login,
            },
          });

          return {
            raw,
            view: formatSettingsResponse(raw),
          };
        },
      );

      const getRedoLogs: HomeworkCommonFeatureShape["getRedoLogs"] = Effect.fn("features.homework.common.redoLogs")(
        function* (input) {
          const login = yield* resolveLogin();
          const raw = yield* educoder.HomeworkCommon.redoLogs({
            params: {
              homeworkId: input.homeworkId,
            },
            query: {
              type: input.type,
              limit: input.limit,
              page: input.page,
              zzud: login,
            },
          });

          return {
            raw,
            view: {
              redoLogs: {
                status: raw.status,
                message: raw.message,
                homeworkType: raw.data.homework_type,
                count: raw.data.count,
                list: raw.data.list ?? [],
              },
            },
          };
        },
      );

      return HomeworkCommonFeature.of({
        list,
        getInfo,
        getWorks,
        getDraft,
        searchMembers,
        getComments,
        getSettings,
        getRedoLogs,
      });
    }),
  );
}
