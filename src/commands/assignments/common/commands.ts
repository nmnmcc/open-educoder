import { Console, Effect } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";

import { CommonAssignmentFeature } from "../../../services/features/assignments/common.js";
import { AssignmentIdArgument, CourseId, PositiveInteger } from "../flags.js";
import { renderGeneric } from "../render.js";
import { optionToUndefined, printJson } from "../shared.js";

const CategoryId = Flag.string("category-id").pipe(
  Flag.withDescription("Optional assignment category ID when Educoder requires one."),
  Flag.optional,
);
const WorkId = Argument.string("work-id").pipe(Argument.withDescription("Student work ID returned after submission."));
const AttachmentFiles = Argument.path("file", { pathType: "file", mustExist: true }).pipe(
  Argument.withDescription("Local attachment file to upload."),
  Argument.variadic(),
  Argument.withDefault([] as ReadonlyArray<string>),
);
const RequiredAttachmentFiles = Argument.path("file", { pathType: "file", mustExist: true }).pipe(
  Argument.withDescription("Local attachment file to upload."),
  Argument.variadic({ min: 1 }),
);
const Description = Flag.string("description").pipe(
  Flag.withDescription("Submission text description."),
  Flag.withDefault(""),
);
const UserId = Flag.string("user-id").pipe(
  Flag.withDescription("Student work user ID; defaults to the work ID."),
  Flag.optional,
);
const HistoryId = Flag.string("history-id").pipe(
  Flag.withDescription("History ID for historical submission detail; defaults to empty."),
  Flag.optional,
);

export const Info = Command.make(
  "info",
  {
    homeworkId: AssignmentIdArgument,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw assignment detail response as JSON.")),
  },
  Effect.fn("assignments.common.info")(function* (input) {
    const commonAssignmentFeature = yield* CommonAssignmentFeature;
    const result = yield* commonAssignmentFeature.getInfo({ homeworkId: input.homeworkId });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("普通作业详情 / Common Assignment Info", result.view));
  }),
).pipe(
  Command.withDescription("Show one common assignment's instructions, attachments, and metadata."),
  Command.withExamples([
    {
      command: "open-educoder assignments common info 3487339",
      description: "Inspect an assignment by assignment ID",
    },
    {
      command: "open-educoder assignments common info 3487339 --json",
      description: "Print the raw detail response as JSON",
    },
  ]),
  Command.withAlias("i"),
);

export const Work = Command.make(
  "work",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    categoryId: CategoryId,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw work status response as JSON.")),
  },
  Effect.fn("assignments.common.work")(function* (input) {
    const commonAssignmentFeature = yield* CommonAssignmentFeature;
    const result = yield* commonAssignmentFeature.getWork({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      categoryId: optionToUndefined(input.categoryId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("作品状态 / Work Status", result.view));
  }),
).pipe(
  Command.withDescription("Show your submission/work status, score, and related state for one assignment."),
  Command.withExamples([
    {
      command: "open-educoder assignments common work 109348 3487339",
      description: "Inspect your current work status",
    },
    {
      command: "open-educoder assignments common work 109348 3487339 --json",
      description: "Print the work summary as JSON",
    },
  ]),
  Command.withAlias("w"),
);

export const Draft = Command.make(
  "draft",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    type: Flag.integer("type").pipe(Flag.withDescription("Educoder draft type code."), Flag.withDefault(3)),
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw draft response as JSON.")),
  },
  Effect.fn("assignments.common.draft")(function* (input) {
    const commonAssignmentFeature = yield* CommonAssignmentFeature;
    const result = yield* commonAssignmentFeature.getDraft({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      type: input.type,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("草稿上下文 / Draft Context", result.view));
  }),
).pipe(
  Command.withDescription("Show the current draft context for a common assignment."),
  Command.withExamples([
    {
      command: "open-educoder assignments common draft 109348 3487339",
      description: "Read your current draft snapshot",
    },
  ]),
  Command.withAlias("n"),
);

export const Submit = Command.make(
  "submit",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    files: AttachmentFiles,
    description: Description,
    type: Flag.integer("type").pipe(Flag.withDescription("Educoder submission type code."), Flag.withDefault(3)),
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw submit workflow response as JSON.")),
  },
  Effect.fn("assignments.common.submit")(function* (input) {
    const commonAssignmentFeature = yield* CommonAssignmentFeature;
    const result = yield* commonAssignmentFeature.submit({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      description: input.description,
      files: input.files,
      type: input.type,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("提交结果 / Submit Result", result.view));
  }),
).pipe(
  Command.withDescription("Upload attachment files and submit a common assignment."),
  Command.withExamples([
    {
      command: 'open-educoder assignments common submit 109348 3487337 ./report.doc --description "见附件。"',
      description: "Submit an assignment with one attachment",
    },
    {
      command: 'open-educoder assignments common submit 109348 3487337 --description "已完成"',
      description: "Submit text without attachments",
    },
  ]),
  Command.withAlias("S"),
);

export const UploadAttachments = Command.make(
  "upload-attachments",
  {
    files: RequiredAttachmentFiles,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw attachment upload response as JSON.")),
  },
  Effect.fn("assignments.common.uploadAttachments")(function* (input) {
    const commonAssignmentFeature = yield* CommonAssignmentFeature;
    const result = yield* commonAssignmentFeature.uploadAttachments({
      files: input.files,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("附件上传 / Attachment Upload", result.view));
  }),
).pipe(
  Command.withDescription("Upload attachment files and print attachment IDs without submitting homework."),
  Command.withExamples([
    {
      command: "open-educoder assignments common upload-attachments ./report.doc",
      description: "Upload one attachment without submitting",
    },
  ]),
  Command.withAlias("A"),
);

export const Submission = Command.make(
  "submission",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    workId: WorkId,
    userId: UserId,
    historyId: HistoryId,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw student work response as JSON.")),
  },
  Effect.fn("assignments.common.submission")(function* (input) {
    const commonAssignmentFeature = yield* CommonAssignmentFeature;
    const result = yield* commonAssignmentFeature.getStudentWork({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      workId: input.workId,
      userId: optionToUndefined(input.userId),
      historyId: optionToUndefined(input.historyId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("提交详情 / Submission Detail", result.view));
  }),
).pipe(
  Command.withDescription("Show a submitted common-assignment work detail page."),
  Command.withExamples([
    {
      command: "open-educoder assignments common submission 109348 3487337 284733932",
      description: "Read one submitted work detail",
    },
  ]),
  Command.withAlias("v"),
);

export const SupplyAttachments = Command.make(
  "supply-attachments",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    workId: WorkId,
    userId: UserId,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw supply-attachments response as JSON.")),
  },
  Effect.fn("assignments.common.supplyAttachments")(function* (input) {
    const commonAssignmentFeature = yield* CommonAssignmentFeature;
    const result = yield* commonAssignmentFeature.getSupplyAttachments({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      workId: input.workId,
      userId: optionToUndefined(input.userId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("补交附件 / Supply Attachments", result.view));
  }),
).pipe(
  Command.withDescription("Show revised/supply attachment state for one submitted work."),
  Command.withExamples([
    {
      command: "open-educoder assignments common supply-attachments 109348 3487337 284733932",
      description: "Read supply attachment metadata",
    },
  ]),
  Command.withAlias("a"),
);

export const WorkComments = Command.make(
  "work-comments",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    workId: WorkId,
    userId: UserId,
    invalid: Flag.boolean("invalid").pipe(Flag.withDescription("Fetch invalid comments instead of valid comments.")),
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw work comments response as JSON.")),
  },
  Effect.fn("assignments.common.workComments")(function* (input) {
    const commonAssignmentFeature = yield* CommonAssignmentFeature;
    const result = yield* commonAssignmentFeature.getWorkComments({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      workId: input.workId,
      userId: optionToUndefined(input.userId),
      invalid: input.invalid,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("作品评论 / Work Comments", result.view));
  }),
).pipe(
  Command.withDescription("Show comment summary for one submitted common-assignment work."),
  Command.withExamples([
    {
      command: "open-educoder assignments common work-comments 109348 3487337 284733932",
      description: "Read work comment state",
    },
  ]),
  Command.withAlias("m"),
);

export const Members = Command.make(
  "members",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    page: PositiveInteger("page").pipe(Flag.withDescription("Page number to fetch."), Flag.withDefault(1)),
    limit: PositiveInteger("limit").pipe(Flag.withDescription("Members per page."), Flag.withDefault(20)),
    search: Flag.string("search").pipe(
      Flag.withDescription("Student number, name, or keyword to search."),
      Flag.withDefault(""),
    ),
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw members response as JSON.")),
  },
  Effect.fn("assignments.common.members")(function* (input) {
    const commonAssignmentFeature = yield* CommonAssignmentFeature;
    const result = yield* commonAssignmentFeature.searchMembers({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      page: input.page,
      limit: input.limit,
      search: input.search,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("成员列表 / Members", result.view));
  }),
).pipe(
  Command.withDescription("Search course members and show their submission status for one assignment."),
  Command.withExamples([
    {
      command: "open-educoder assignments common members 109348 3487339 --search keyword",
      description: "Search by student number or name",
    },
  ]),
  Command.withAlias("u"),
);

export const Comments = Command.make(
  "comments",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    categoryId: CategoryId,
    pageSize: PositiveInteger("page-size").pipe(
      Flag.withDescription("Number of comments to fetch."),
      Flag.withDefault(10),
    ),
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw comments response as JSON.")),
  },
  Effect.fn("assignments.common.comments")(function* (input) {
    const commonAssignmentFeature = yield* CommonAssignmentFeature;
    const result = yield* commonAssignmentFeature.getComments({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      categoryId: optionToUndefined(input.categoryId),
      pageSize: input.pageSize,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("评论 / Comments", result.view));
  }),
).pipe(
  Command.withDescription("Show discussion comments for one common assignment."),
  Command.withExamples([
    {
      command: "open-educoder assignments common comments 109348 3487339",
      description: "Read assignment comments",
    },
  ]),
  Command.withAlias("q"),
);

export const Settings = Command.make(
  "settings",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    categoryId: CategoryId,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw settings response as JSON.")),
  },
  Effect.fn("assignments.common.settings")(function* (input) {
    const commonAssignmentFeature = yield* CommonAssignmentFeature;
    const result = yield* commonAssignmentFeature.getSettings({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      categoryId: optionToUndefined(input.categoryId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("作业设置 / Assignment Settings", result.view));
  }),
).pipe(
  Command.withDescription("Show rules such as deadline, scoring, visibility, and submission constraints."),
  Command.withExamples([
    {
      command: "open-educoder assignments common settings 109348 3487339",
      description: "Inspect assignment settings",
    },
  ]),
  Command.withAlias("g"),
);

export const RedoLogs = Command.make(
  "redo-logs",
  {
    homeworkId: AssignmentIdArgument,
    type: Flag.integer("type").pipe(Flag.withDescription("Educoder redo-log type code."), Flag.withDefault(2)),
    page: PositiveInteger("page").pipe(Flag.withDescription("Page number to fetch."), Flag.withDefault(1)),
    limit: PositiveInteger("limit").pipe(Flag.withDescription("Redo log entries per page."), Flag.withDefault(10)),
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw redo-log response as JSON.")),
  },
  Effect.fn("assignments.common.redoLogs")(function* (input) {
    const commonAssignmentFeature = yield* CommonAssignmentFeature;
    const result = yield* commonAssignmentFeature.getRedoLogs({
      homeworkId: input.homeworkId,
      type: input.type,
      page: input.page,
      limit: input.limit,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("重做记录 / Redo Logs", result.view));
  }),
).pipe(
  Command.withDescription("Show redo attempts and redo history for one common assignment."),
  Command.withExamples([
    {
      command: "open-educoder assignments common redo-logs 3487339 --type 2",
      description: "Read redo attempts and history",
    },
  ]),
  Command.withAlias("d"),
);
