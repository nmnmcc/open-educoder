import { Console, Effect } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";
import {
  CourseSortByChoices,
  CourseStatusChoices,
  CourseFeature,
  SortDirectionChoices,
} from "../services/features/course.js";
import { inspectOptions } from "../utils/inspect-options.js";

const PositiveInteger = (name: string) =>
  Flag.integer(name).pipe(
    Flag.filter(
      (value) => value >= 1,
      (value) => `${name} must be greater than or equal to 1, got ${value}`,
    ),
  );
const CourseId = Argument.string("course-id");

const printJson = (value: unknown) => Console.log(JSON.stringify(value, null, 2));

const List = Command.make(
  "list",
  {
    status: Flag.choice("status", CourseStatusChoices).pipe(Flag.withDefault("processing")),
    page: PositiveInteger("page").pipe(Flag.withDefault(1)),
    perPage: PositiveInteger("per-page").pipe(Flag.withDefault(15)),
    sortBy: Flag.choice("sort-by", CourseSortByChoices).pipe(Flag.withDefault("updated_at")),
    sortDirection: Flag.choice("sort-direction", SortDirectionChoices).pipe(Flag.withDefault("desc")),
    category: Flag.string("category").pipe(Flag.withDefault("")),
    json: Flag.boolean("json"),
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

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("List courses visible to the current Educoder account."),
  Command.withExamples([
    { command: "open-educoder course list", description: "List ongoing courses sorted by latest update" },
    { command: "open-educoder course list --status all --json", description: "List all courses as JSON" },
    {
      command: "open-educoder course list --status end --sort-by created_at --sort-direction asc",
      description: "List ended courses by creation time",
    },
  ]),
  Command.withAlias("l"),
);

const Info = Command.make(
  "info",
  {
    courseId: CourseId,
    json: Flag.boolean("json"),
  },
  Effect.fn("course.info")(function* (input) {
    const courseFeature = yield* CourseFeature;
    const result = yield* courseFeature.getInfo({ courseId: input.courseId });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Show top-banner metadata for a course, including teachers, counts, and visibility."),
  Command.withExamples([
    {
      command: "open-educoder course info MOAPGNLO",
      description: "Inspect a course by course ID",
    },
    { command: "open-educoder course info MOAPGNLO --json", description: "Print the raw course metadata as JSON" },
  ]),
  Command.withAlias("i"),
);

const Modules = Command.make(
  "modules",
  {
    courseId: CourseId,
    json: Flag.boolean("json"),
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

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Show course navigation modules and nested category IDs."),
  Command.withExamples([
    { command: "open-educoder course modules MOAPGNLO", description: "List modules for a course" },
    { command: "open-educoder course modules MOAPGNLO --json", description: "Print raw module data as JSON" },
  ]),
  Command.withAlias("m"),
);

export const Course = Command.make("course").pipe(
  Command.withDescription("Inspect Educoder courses, course metadata, and course navigation modules."),
  Command.withExamples([
    { command: "open-educoder course list --status all", description: "List all courses for the current user" },
    {
      command: "open-educoder course info MOAPGNLO",
      description: "Inspect a course by course ID",
    },
    {
      command: "open-educoder course modules MOAPGNLO",
      description: "Show modules and nested categories for a course",
    },
  ]),
  Command.withAlias("c"),
  Command.withSubcommands([List, Info, Modules]),
);
