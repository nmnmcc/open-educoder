import { Console, Effect } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";

import {
  CourseFeature,
  CourseSortByChoices,
  CourseStatusChoices,
  SortDirectionChoices,
} from "../services/features/course.js";
import { record, renderFields, renderListedCount, renderTable } from "./shared/output.js";

const PositiveInteger = (name: string) =>
  Flag.integer(name).pipe(
    Flag.filter(
      (value) => value >= 1,
      (value) => `${name} must be greater than or equal to 1, got ${value}`,
    ),
  );
const CourseId = Argument.string("course-id").pipe(
  Argument.withDescription("Course ID shown by `courses list`, such as MOAPGNLO."),
);

const printJson = (value: unknown) => Console.log(JSON.stringify(value, null, 2));

const renderCourses = (view: unknown) => {
  const root = record(view);
  const courses = Object.entries(record(root["courses"])).map(([id, courseValue]) => ({
    id,
    course: record(courseValue),
  }));

  return [
    "COURSES",
    renderFields([["Total", root["total"]]]),
    "",
    renderTable(courses, [
      { header: "COURSE", value: (row) => row.id },
      { header: "STATE", value: (row) => row.course["status"] },
      { header: "MEMBERS", value: (row) => row.course["members"] },
      { header: "ASSIGN", value: (row) => row.course["assignments"] },
      { header: "VISITS", value: (row) => row.course["visits"] },
      { header: "TEACHER", value: (row) => row.course["teacher"] },
      { header: "SCHOOL", value: (row) => row.course["school"] },
      { header: "NAME", value: (row) => row.course["name"] },
    ]),
    "",
    renderListedCount(courses.length, "course"),
  ].join("\n");
};

const renderCourseInfo = (view: unknown) => {
  const course = record(record(view)["course"]);

  return [
    "COURSE",
    renderFields([
      ["ID", course["id"]],
      ["Name", course["name"]],
      ["State", course["ended"] === true ? "end" : "processing"],
      ["Public", course["public"]],
      ["Teacher", course["teacher"]],
      ["School", course["teacherSchool"]],
      ["Group", course["group"]],
      ["Teachers", course["teachers"]],
      ["Teacher Count", course["teacherCount"]],
      ["Student Count", course["studentCount"]],
      ["Group Count", course["groupCount"]],
      ["Credit", course["credit"]],
      ["Class Period", course["classPeriod"]],
      ["Visits", course["visits"]],
      ["Invite Code", course["inviteCode"]],
      ["Messages", course["allowViewMessage"]],
    ]),
  ].join("\n");
};

const renderCourseModules = (view: unknown) => {
  const modules = Object.entries(record(record(view)["modules"])).map(([id, moduleValue]) => ({
    id,
    module: record(moduleValue),
  }));
  const categories = modules.flatMap((moduleRow) =>
    Object.entries(record(moduleRow.module["categories"])).map(([id, categoryValue]) => ({
      id,
      moduleId: moduleRow.id,
      category: record(categoryValue),
    })),
  );
  const lines = [
    "COURSE MODULES",
    renderTable(modules, [
      { header: "MODULE", value: (row) => row.id },
      { header: "POS", value: (row) => row.module["position"] },
      { header: "TYPE", value: (row) => row.module["type"] },
      { header: "NAME", value: (row) => row.module["name"] },
      { header: "URL", value: (row) => row.module["url"] },
    ]),
    "",
    renderListedCount(modules.length, "module"),
  ];

  if (categories.length >= 1) {
    lines.push(
      "",
      "CATEGORIES",
      renderTable(categories, [
        { header: "CATEGORY", value: (row) => row.id },
        { header: "MODULE", value: (row) => row.moduleId },
        { header: "POS", value: (row) => row.category["position"] },
        { header: "TYPE", value: (row) => row.category["type"] },
        { header: "NAME", value: (row) => row.category["name"] },
        { header: "URL", value: (row) => row.category["url"] },
      ]),
      "",
      renderListedCount(categories.length, "category", "categories"),
    );
  }

  return lines.join("\n");
};

const List = Command.make(
  "list",
  {
    status: Flag.choice("status", CourseStatusChoices).pipe(
      Flag.withDescription("Course status filter: processing, end, or all."),
      Flag.withDefault("processing"),
    ),
    page: PositiveInteger("page").pipe(Flag.withDescription("Page number to fetch."), Flag.withDefault(1)),
    perPage: PositiveInteger("per-page").pipe(Flag.withDescription("Courses per page."), Flag.withDefault(15)),
    sortBy: Flag.choice("sort-by", CourseSortByChoices).pipe(
      Flag.withDescription("Field used to sort courses."),
      Flag.withDefault("updated_at"),
    ),
    sortDirection: Flag.choice("sort-direction", SortDirectionChoices).pipe(
      Flag.withDescription("Sort direction."),
      Flag.withDefault("desc"),
    ),
    category: Flag.string("category").pipe(
      Flag.withDescription("Optional Educoder course category filter."),
      Flag.withDefault(""),
    ),
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw course list as JSON.")),
  },
  Effect.fn("course.list")(function* (input) {
    const courseFeature = yield* CourseFeature;
    const result = yield* courseFeature.list({
      status: input.status,
      page: input.page,
      perPage: input.perPage,
      sortBy: input.sortBy,
      sortDirection: input.sortDirection,
      category: input.category,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    if (result.raw.courses.length === 0) {
      return yield* Console.log("No courses found.");
    }

    yield* Console.log(renderCourses(result.view));
  }),
).pipe(
  Command.withDescription("List courses visible to the selected account."),
  Command.withExamples([
    { command: "open-educoder courses list", description: "List ongoing courses sorted by latest update" },
    { command: "open-educoder courses list --status all --json", description: "List all courses in JSON format" },
    {
      command: "open-educoder courses list --status end --sort-by created_at --sort-direction asc",
      description: "List ended courses by creation time",
    },
  ]),
  Command.withAlias("l"),
);

const Info = Command.make(
  "info",
  {
    courseId: CourseId,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw course metadata as JSON.")),
  },
  Effect.fn("course.info")(function* (input) {
    const courseFeature = yield* CourseFeature;
    const result = yield* courseFeature.getInfo({ courseId: input.courseId });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderCourseInfo(result.view));
  }),
).pipe(
  Command.withDescription("Show one course's title, teachers, counts, and visibility."),
  Command.withExamples([
    {
      command: "open-educoder courses info MOAPGNLO",
      description: "Open a course summary by course ID",
    },
    { command: "open-educoder courses info MOAPGNLO --json", description: "Print the raw course metadata as JSON" },
  ]),
  Command.withAlias("i"),
);

const Modules = Command.make(
  "modules",
  {
    courseId: CourseId,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw module list as JSON.")),
  },
  Effect.fn("course.modules")(function* (input) {
    const courseFeature = yield* CourseFeature;
    const result = yield* courseFeature.listModules({ courseId: input.courseId });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    if (result.raw.course_modules.length === 0) {
      return yield* Console.log("No modules found.");
    }

    yield* Console.log(renderCourseModules(result.view));
  }),
).pipe(
  Command.withDescription("Show course modules and category IDs used to filter assignments."),
  Command.withExamples([
    { command: "open-educoder courses modules MOAPGNLO", description: "List modules for a course" },
    { command: "open-educoder courses modules MOAPGNLO --json", description: "Print raw module data as JSON" },
  ]),
  Command.withAlias("m"),
);

export const Courses = Command.make("courses").pipe(
  Command.withDescription("Find course IDs, inspect course info, and list assignment categories."),
  Command.withExamples([
    { command: "open-educoder courses list --status all", description: "List all courses for the current user" },
    {
      command: "open-educoder courses info MOAPGNLO",
      description: "View course metadata by course ID",
    },
    {
      command: "open-educoder courses modules MOAPGNLO",
      description: "Show modules and categories for a course",
    },
  ]),
  Command.withAlias("c"),
  Command.withSubcommands([List, Info, Modules]),
);
