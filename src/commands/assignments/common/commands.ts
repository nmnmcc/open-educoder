import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { CommonAssignmentFeature } from "../../../services/features/assignments/common.js";
import { CourseId, AssignmentIdArgument, PositiveInteger } from "../flags.js";
import { renderGeneric } from "../render.js";
import { optionToUndefined, printJson } from "../shared.js";

const CategoryId = Flag.string("category-id").pipe(Flag.optional);

export const Info = Command.make(
  "info",
  {
    homeworkId: AssignmentIdArgument,
    json: Flag.boolean("json"),
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
  Command.withDescription("Show one common assignment's metadata, instructions, and attachments."),
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
    json: Flag.boolean("json"),
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
  Command.withDescription("Show your work summary, score, and submit state for a common assignment."),
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
    type: Flag.integer("type").pipe(Flag.withDefault(3)),
    json: Flag.boolean("json"),
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
  Command.withDescription("Open draft context for a common assignment."),
  Command.withExamples([
    {
      command: "open-educoder assignments common draft 109348 3487339",
      description: "Read your current draft snapshot",
    },
  ]),
  Command.withAlias("n"),
);

export const Members = Command.make(
  "members",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    page: PositiveInteger("page").pipe(Flag.withDefault(1)),
    limit: PositiveInteger("limit").pipe(Flag.withDefault(20)),
    search: Flag.string("search").pipe(Flag.withDefault("")),
    json: Flag.boolean("json"),
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
  Command.withDescription("Search members and view their common-assignment submission status."),
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
    pageSize: PositiveInteger("page-size").pipe(Flag.withDefault(10)),
    json: Flag.boolean("json"),
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
  Command.withDescription("Open discussion comments for a common assignment."),
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
    json: Flag.boolean("json"),
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
  Command.withDescription("Show assignment rules such as deadline, scoring, visibility, and constraints."),
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
    type: Flag.integer("type").pipe(Flag.withDefault(2)),
    page: PositiveInteger("page").pipe(Flag.withDefault(1)),
    limit: PositiveInteger("limit").pipe(Flag.withDefault(10)),
    json: Flag.boolean("json"),
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
  Command.withDescription("Show redo history for one common assignment."),
  Command.withExamples([
    {
      command: "open-educoder assignments common redo-logs 3487339 --type 2",
      description: "Read redo attempts and history",
    },
  ]),
  Command.withAlias("d"),
);
