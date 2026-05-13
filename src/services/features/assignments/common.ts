import { Context, Effect, Layer } from "effect";

import { AppContext } from "../../context/index.js";
import { EducoderApi } from "../../educoder-api/index.js";
import { type EducoderApiResponse, type FeatureWorkflow } from "../shared.js";
import { type AssignmentSortBy, type AssignmentSortDirection, AssignmentTypeCode, formatLabels } from "./shared.js";

const resolveCategoryId = (homeworkId: string, categoryId?: string | undefined) => categoryId ?? homeworkId;

type HomeworkCommonsRaw = EducoderApiResponse<"Course", "homeworkCommons">;
type CommonHomeworkInfoRaw = EducoderApiResponse<"HomeworkCommon", "info">;
type CommonHomeworkWorksRaw = EducoderApiResponse<"HomeworkCommon", "worksList">;
type CommonHomeworkDraftRaw = EducoderApiResponse<"HomeworkCommon", "studentWorkNew">;
type CommonHomeworkMembersRaw = EducoderApiResponse<"HomeworkCommon", "searchMemberList">;
type CommonHomeworkCommentsRaw = EducoderApiResponse<"HomeworkCommon", "showComment">;
type CommonHomeworkSettingsRaw = EducoderApiResponse<"HomeworkCommon", "settings">;
type CommonHomeworkRedoLogsRaw = EducoderApiResponse<"HomeworkCommon", "redoLogs">;

type CommonHomeworkBaseRaw = {
  readonly course_id: number;
  readonly course_name: string;
  readonly is_end: boolean;
  readonly course_end_date?: string | null | undefined;
  readonly category: {
    readonly category_id: number;
    readonly category_name: string;
    readonly main: number;
  };
  readonly homework_status: ReadonlyArray<string>;
  readonly time_status: number;
  readonly open_evaluate?: boolean | null | undefined;
  readonly homework_name: string;
  readonly homework_id: number;
  readonly homework_type: string;
};

const formatBaseAssignment = (value: CommonHomeworkBaseRaw) => {
  return {
    id: value.homework_id,
    name: value.homework_name,
    type: value.homework_type,
    course: {
      id: value.course_id,
      name: value.course_name,
      ended: value.is_end,
      endDate: value.course_end_date ?? null,
    },
    category: {
      id: value.category.category_id,
      name: value.category.category_name,
      main: value.category.main,
    },
    status: formatLabels(value.homework_status),
    timeStatus: value.time_status,
    openEvaluate: value.open_evaluate ?? null,
  };
};

const formatAttachments = (value: CommonHomeworkInfoRaw["attachments"]) =>
  Object.fromEntries(
    (value ?? []).map((attachment, index) => {
      const id = attachment.id ?? index + 1;

      return [
        id,
        {
          title: attachment.title ?? null,
          size: attachment.filesize ?? null,
          type: attachment.file_type ?? null,
          subtype: attachment.file_sub ?? null,
          pdf: attachment.is_pdf ?? null,
          editable: attachment.is_edit ?? null,
          url: attachment.download_url ?? attachment.url ?? null,
        },
      ];
    }),
  );

const formatInfoResponse = (value: CommonHomeworkInfoRaw) => {
  return {
    assignment: {
      ...formatBaseAssignment(value),
      workId: value.work_id ?? null,
      workStatus: value.work_statuses == null ? null : formatLabels(value.work_statuses),
      canSubmit: value.can_submit ?? null,
      answerPublic: value.answer_public ?? null,
      viewAnswer: value.view_answer ?? null,
      description: value.description ?? null,
      submit: {
        size: value.submit_size ?? null,
        limit: value.submit_limit ?? null,
        limitNum: value.submit_limit_num ?? null,
        mustFile: value.must_file ?? null,
      },
      attachments: formatAttachments(value.attachments),
    },
  };
};

const formatWorksResponse = (value: CommonHomeworkWorksRaw) => {
  return {
    assignment: formatBaseAssignment(value),
    work: {
      id: value.work_id ?? value.id ?? null,
      status: value.work_status ?? null,
      updateTime: value.update_time ?? null,
      scores: {
        work: value.work_score ?? null,
        final: value.final_score ?? null,
        teacher: value.teacher_score ?? null,
        student: value.student_score ?? null,
        assistant: value.teaching_asistant_score ?? null,
        groupLeader: value.group_leader_score ?? null,
      },
      submit: {
        canSubmit: value.can_submit ?? null,
        submitNum: value.submit_num ?? null,
        submitCount: value.submit_count ?? null,
        redoCount: value.redo_count ?? null,
        size: value.submit_size ?? null,
        commitCount: value.commit_count ?? null,
        uncommitCount: value.uncommit_count ?? null,
        leftTime:
          value.left_time == null
            ? null
            : {
                status: value.left_time.status,
                time: value.left_time.time,
              },
      },
      user: {
        login: value.user_login ?? null,
        name: value.user_name ?? null,
        studentId: value.student_id ?? null,
        group: value.group_name ?? null,
      },
      taCommentCount: value.ta_comment_count ?? null,
      groupData: value.group_data ?? null,
      studentWorksCount: null,
    },
  };
};

const formatMember = (member: CommonHomeworkMembersRaw["members"][number]) => {
  return {
    name: member.user_name,
    studentId: member.student_id ?? null,
    group: member.group_name ?? null,
    committed: member.commit_status ?? null,
    team: member.is_team ?? null,
  };
};

const formatSettingsResponse = (value: CommonHomeworkSettingsRaw) => {
  return {
    assignment: formatBaseAssignment(value),
    schedule: {
      publishTime: value.publish_time ?? null,
      endTime: value.end_time ?? null,
      lateTime: value.late_time ?? null,
      allowLate: value.allow_late ?? null,
      latePenalty: value.late_penalty ?? null,
    },
    submit: {
      canSubmit: value.can_submit ?? null,
      canMakeUp: value.can_make_up ?? null,
      submitNum: value.submit_num ?? null,
      submitSize: value.submit_size ?? null,
      limit: value.submit_limit ?? null,
      limitNum: value.submit_limit_num ?? null,
      mustFile: value.must_file ?? null,
    },
    score: {
      total: value.total_score ?? null,
      open: value.score_open ?? null,
      workPublic: value.work_public ?? null,
      answerPublic: value.answer_public ?? null,
      commentPublic: value.comment_public ?? null,
      details: value.score_details ?? [],
    },
    groups: {
      allUsers: value.all_user_size ?? null,
      settingsCount: value.group_settings == null ? null : value.group_settings.length,
      allowLateSettingsCount: value.allow_late_settings == null ? null : value.allow_late_settings.length,
    },
    anonymous: {
      comment: value.anonymous_comment ?? null,
      appeal: value.anonymous_appeal ?? null,
    },
    canEdit: value.can_edit ?? null,
    studentWorks: value.student_works ?? null,
  };
};

type ListCommonAssignmentsInput = {
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

type AssignmentIdInput = {
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

type ListCommonAssignmentsView = {
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
  readonly draft: ReturnType<typeof formatBaseAssignment>;
};
type CommonHomeworkMembersView = {
  readonly ai: boolean;
  readonly members: Record<string, ReturnType<typeof formatMember>>;
};
type CommonHomeworkCommentsView = {
  readonly comments: {
    readonly assignmentUserId: number;
    readonly messagesCount: number;
    readonly parentMessagesCount: number;
    readonly items: ReadonlyArray<never>;
  };
};
type CommonHomeworkSettingsView = ReturnType<typeof formatSettingsResponse>;
type CommonHomeworkRedoLogsView = {
  readonly redoLogs: {
    readonly status: number;
    readonly message: string;
    readonly assignmentType: string | undefined;
    readonly count: number | undefined;
    readonly list: ReadonlyArray<unknown>;
  };
};

export type CommonAssignmentFeatureShape = {
  readonly list: FeatureWorkflow<ListCommonAssignmentsInput, HomeworkCommonsRaw, ListCommonAssignmentsView>;
  readonly getInfo: FeatureWorkflow<AssignmentIdInput, CommonHomeworkInfoRaw, CommonHomeworkInfoView>;
  readonly getWork: FeatureWorkflow<CommonHomeworkWithCourseInput, CommonHomeworkWorksRaw, CommonHomeworkWorksView>;
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

export class CommonAssignmentFeature extends Context.Service<CommonAssignmentFeature, CommonAssignmentFeatureShape>()(
  "open-educoder/services/features/CommonAssignmentFeature",
) {
  public static readonly layer = Layer.effect(
    CommonAssignmentFeature,
    Effect.gen(function* () {
      const ctx = yield* AppContext;
      const educoder = yield* EducoderApi;

      const resolveLogin = Effect.fn("features.assignments.common.resolveLogin")(function* () {
        const user = yield* ctx.user;

        return user.login;
      });

      const list: CommonAssignmentFeatureShape["list"] = Effect.fn("features.assignments.common.list")(
        function* (input) {
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
              type: AssignmentTypeCode.common,
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
                    workStatus: item.work_status == null ? null : formatLabels(item.work_status),
                    uncommitted: item.un_commit_work ?? null,
                    labStatus: item.lab_status ?? null,
                  },
                ]),
              ),
            },
          };
        },
      );

      const getInfo: CommonAssignmentFeatureShape["getInfo"] = Effect.fn("features.assignments.common.info")(
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

      const getWork: CommonAssignmentFeatureShape["getWork"] = Effect.fn("features.assignments.common.work")(
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

      const getDraft: CommonAssignmentFeatureShape["getDraft"] = Effect.fn("features.assignments.common.draft")(
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
              draft: formatBaseAssignment(raw),
            },
          };
        },
      );

      const searchMembers: CommonAssignmentFeatureShape["searchMembers"] = Effect.fn(
        "features.assignments.common.members",
      )(function* (input) {
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
            members: Object.fromEntries(raw.members.map((member) => [member.user_id, formatMember(member)])),
          },
        };
      });

      const getComments: CommonAssignmentFeatureShape["getComments"] = Effect.fn(
        "features.assignments.common.comments",
      )(function* (input) {
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
              assignmentUserId: raw.homework_user_id,
              messagesCount: raw.messages_count,
              parentMessagesCount: raw.parent_messages_count,
              items: [],
            },
          },
        };
      });

      const getSettings: CommonAssignmentFeatureShape["getSettings"] = Effect.fn(
        "features.assignments.common.settings",
      )(function* (input) {
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
      });

      const getRedoLogs: CommonAssignmentFeatureShape["getRedoLogs"] = Effect.fn(
        "features.assignments.common.redoLogs",
      )(function* (input) {
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
              assignmentType: raw.data.homework_type,
              count: raw.data.count,
              list: [],
            },
          },
        };
      });

      return CommonAssignmentFeature.of({
        list,
        getInfo,
        getWork,
        getDraft,
        searchMembers,
        getComments,
        getSettings,
        getRedoLogs,
      });
    }),
  );
}
