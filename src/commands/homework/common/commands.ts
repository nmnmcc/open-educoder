import { Console, Effect, Option } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../../services/educoder-api/index.js";
import { CourseId, HomeworkIdArgument, PositiveInteger } from "../flags.js";
import {
  asArray,
  asRecord,
  booleanField,
  formatLabels,
  inspectOptions,
  numberField,
  printJson,
  resolveLogin,
  stringField,
} from "../shared.js";

const CategoryId = Flag.string("category-id").pipe(Flag.optional);

const resolveCategoryId = (homeworkId: string, categoryId: Option.Option<string>) =>
  Option.isSome(categoryId) ? categoryId.value : homeworkId;

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

export const Info = Command.make(
  "info",
  {
    homeworkId: HomeworkIdArgument,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.common.info")(function* (input) {
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin();
    const response = yield* educoder.HomeworkCommon.info({
      params: {
        homeworkId: input.homeworkId,
      },
      query: {
        zzud: login,
      },
    });

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(formatInfoResponse(response), inspectOptions);
  }),
).pipe(
  Command.withDescription("Show detail metadata, instructions, and attachments for a common homework."),
  Command.withExamples([
    {
      command: "open-educoder homework common info 3487339",
      description: "Inspect a common homework by homework ID",
    },
    {
      command: "open-educoder homework common info 3487339 --json",
      description: "Print the raw common homework detail as JSON",
    },
  ]),
  Command.withAlias("i"),
);

export const Works = Command.make(
  "works",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    categoryId: CategoryId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.common.works")(function* (input) {
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin();
    const categoryId = resolveCategoryId(input.homeworkId, input.categoryId);
    const response = yield* educoder.HomeworkCommon.worksList({
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

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(formatWorksResponse(response), inspectOptions);
  }),
).pipe(
  Command.withDescription("Show the current user's work summary and submission counters for a common homework."),
  Command.withExamples([
    {
      command: "open-educoder homework common works 109348 3487339",
      description: "Inspect current work status for a common homework",
    },
    {
      command: "open-educoder homework common works 109348 3487339 --json",
      description: "Print the raw works list response as JSON",
    },
  ]),
  Command.withAlias("w"),
);

export const Draft = Command.make(
  "draft",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    type: Flag.integer("type").pipe(Flag.withDefault(3)),
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.common.draft")(function* (input) {
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin();
    const response = yield* educoder.HomeworkCommon.studentWorkNew({
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

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(
      {
        draft: formatBaseHomework(response),
      },
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("Fetch Educoder's new student-work context for a common homework."),
  Command.withExamples([
    {
      command: "open-educoder homework common draft 109348 3487339",
      description: "Read the common homework draft context",
    },
  ]),
  Command.withAlias("n"),
);

export const Members = Command.make(
  "members",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    page: PositiveInteger("page").pipe(Flag.withDefault(1)),
    limit: PositiveInteger("limit").pipe(Flag.withDefault(20)),
    search: Flag.string("search").pipe(Flag.withDefault("")),
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.common.members")(function* (input) {
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin();
    const response = yield* educoder.HomeworkCommon.searchMemberList({
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

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(
      {
        ai: response.is_ai,
        members: Object.fromEntries(
          response.members.map((member, index) => {
            const record = asRecord(member);
            const id = numberField(record, "user_id") ?? index + 1;

            return [id, formatMember(member)];
          }),
        ),
      },
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("Search common homework member submission status."),
  Command.withExamples([
    {
      command: "open-educoder homework common members 109348 3487339 --search 0424",
      description: "Search members by student ID or name",
    },
  ]),
  Command.withAlias("u"),
);

export const Comments = Command.make(
  "comments",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    categoryId: CategoryId,
    pageSize: PositiveInteger("page-size").pipe(Flag.withDefault(10)),
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.common.comments")(function* (input) {
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin();
    const categoryId = resolveCategoryId(input.homeworkId, input.categoryId);
    const response = yield* educoder.HomeworkCommon.showComment({
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

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(
      {
        comments: {
          homeworkUserId: response.homework_user_id,
          messagesCount: response.messages_count,
          parentMessagesCount: response.parent_messages_count,
          items: response.comments,
        },
      },
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("Show discussion comments for a common homework."),
  Command.withExamples([
    {
      command: "open-educoder homework common comments 109348 3487339",
      description: "Read common homework comments",
    },
  ]),
  Command.withAlias("q"),
);

export const Settings = Command.make(
  "settings",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    categoryId: CategoryId,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.common.settings")(function* (input) {
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin();
    const categoryId = resolveCategoryId(input.homeworkId, input.categoryId);
    const response = yield* educoder.HomeworkCommon.settings({
      params: {
        homeworkId: input.homeworkId,
      },
      query: {
        coursesId: input.courseId,
        categoryId,
        zzud: login,
      },
    });

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(formatSettingsResponse(response), inspectOptions);
  }),
).pipe(
  Command.withDescription("Show schedule, scoring, submission, and visibility settings for a common homework."),
  Command.withExamples([
    {
      command: "open-educoder homework common settings 109348 3487339",
      description: "Inspect common homework settings",
    },
  ]),
  Command.withAlias("g"),
);

export const RedoLogs = Command.make(
  "redo-logs",
  {
    homeworkId: HomeworkIdArgument,
    type: Flag.integer("type").pipe(Flag.withDefault(2)),
    page: PositiveInteger("page").pipe(Flag.withDefault(1)),
    limit: PositiveInteger("limit").pipe(Flag.withDefault(10)),
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.common.redoLogs")(function* (input) {
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin();
    const response = yield* educoder.HomeworkCommon.redoLogs({
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

    if (input.json) {
      return yield* printJson(response);
    }

    yield* Console.dir(
      {
        redoLogs: {
          status: response.status,
          message: response.message,
          homeworkType: response.data.homework_type,
          count: response.data.count,
          list: response.data.list ?? [],
        },
      },
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("Show redo logs for a common homework."),
  Command.withExamples([
    {
      command: "open-educoder homework common redo-logs 3487339 --type 2",
      description: "Read redo logs for the current user's common homework work",
    },
  ]),
  Command.withAlias("d"),
);
