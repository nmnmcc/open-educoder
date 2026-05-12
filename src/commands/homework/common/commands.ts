import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkCommonFeature } from "../../../services/features/homework/common.js";
import { CourseId, HomeworkIdArgument, PositiveInteger } from "../flags.js";
import { inspectOptions, optionToUndefined, printJson } from "../shared.js";

const CategoryId = Flag.string("category-id").pipe(Flag.optional);

export const Info = Command.make(
  "info",
  {
    homeworkId: HomeworkIdArgument,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.common.info")(function* (input) {
    const homeworkCommonFeature = yield* HomeworkCommonFeature;
    const result = yield* homeworkCommonFeature.getInfo({ homeworkId: input.homeworkId });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Show one common assignment's metadata, instructions, and attachments."),
  Command.withExamples([
    {
      command: "open-educoder homework common info 3487339",
      description: "Inspect an assignment by homework ID",
    },
    {
      command: "open-educoder homework common info 3487339 --json",
      description: "Print the raw detail response as JSON",
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
    const homeworkCommonFeature = yield* HomeworkCommonFeature;
    const result = yield* homeworkCommonFeature.getWorks({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      categoryId: optionToUndefined(input.categoryId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Show your work summary, score, and submit state for a common assignment."),
  Command.withExamples([
    {
      command: "open-educoder homework common works 109348 3487339",
      description: "Inspect your current work status",
    },
    {
      command: "open-educoder homework common works 109348 3487339 --json",
      description: "Print the work summary as JSON",
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
    const homeworkCommonFeature = yield* HomeworkCommonFeature;
    const result = yield* homeworkCommonFeature.getDraft({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      type: input.type,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Open draft context for a common assignment."),
  Command.withExamples([
    {
      command: "open-educoder homework common draft 109348 3487339",
      description: "Read your current draft snapshot",
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
    const homeworkCommonFeature = yield* HomeworkCommonFeature;
    const result = yield* homeworkCommonFeature.searchMembers({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      page: input.page,
      limit: input.limit,
      search: input.search,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Search members and view their common-assignment submission status."),
  Command.withExamples([
    {
      command: "open-educoder homework common members 109348 3487339 --search 0424",
      description: "Search by student number or name",
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
    const homeworkCommonFeature = yield* HomeworkCommonFeature;
    const result = yield* homeworkCommonFeature.getComments({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      categoryId: optionToUndefined(input.categoryId),
      pageSize: input.pageSize,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Open discussion comments for a common assignment."),
  Command.withExamples([
    {
      command: "open-educoder homework common comments 109348 3487339",
      description: "Read assignment comments",
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
    const homeworkCommonFeature = yield* HomeworkCommonFeature;
    const result = yield* homeworkCommonFeature.getSettings({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      categoryId: optionToUndefined(input.categoryId),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Show assignment rules such as deadline, scoring, visibility, and constraints."),
  Command.withExamples([
    {
      command: "open-educoder homework common settings 109348 3487339",
      description: "Inspect assignment settings",
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
    const homeworkCommonFeature = yield* HomeworkCommonFeature;
    const result = yield* homeworkCommonFeature.getRedoLogs({
      homeworkId: input.homeworkId,
      type: input.type,
      page: input.page,
      limit: input.limit,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Show redo history for one common assignment."),
  Command.withExamples([
    {
      command: "open-educoder homework common redo-logs 3487339 --type 2",
      description: "Read redo attempts and history",
    },
  ]),
  Command.withAlias("d"),
);
