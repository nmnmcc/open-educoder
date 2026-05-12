import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkCommonFeature } from "../../../services/features/homework/common.js";
import { CourseId, HomeworkSortByChoices, PositiveInteger, SortDirectionChoices } from "../flags.js";
import { inspectOptions, optionToUndefined, printJson } from "../shared.js";

export const List = Command.make(
  "list",
  {
    courseId: CourseId,
    category: PositiveInteger("category").pipe(Flag.optional),
    status: Flag.integer("status").pipe(Flag.withDefault(0)),
    page: PositiveInteger("page").pipe(Flag.withDefault(1)),
    limit: PositiveInteger("limit").pipe(Flag.withDefault(20)),
    order: Flag.integer("order").pipe(Flag.optional),
    search: Flag.string("search").pipe(Flag.optional),
    sortBy: Flag.choice("sort-by", HomeworkSortByChoices).pipe(Flag.optional),
    sortDirection: Flag.choice("sort-direction", SortDirectionChoices).pipe(Flag.optional),
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.common.list")(function* (input) {
    const homeworkCommonFeature = yield* HomeworkCommonFeature;
    const result = yield* homeworkCommonFeature.list({
      courseId: input.courseId,
      category: optionToUndefined(input.category),
      status: input.status,
      page: input.page,
      limit: input.limit,
      order: optionToUndefined(input.order),
      search: optionToUndefined(input.search),
      sortBy: optionToUndefined(input.sortBy),
      sortDirection: optionToUndefined(input.sortDirection),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    if (result.raw.homeworks.length === 0) {
      return yield* Console.log("No common homeworks found.");
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("List common assignments in a course with optional filters and sorting."),
  Command.withExamples([
    {
      command: "open-educoder homework common list MOAPGNLO --sort-by position --sort-direction desc",
      description: "Sort by category position and order descending",
    },
    {
      command: "open-educoder homework common list MOAPGNLO --sort-by updated_at --sort-direction asc --order 7",
      description: "Apply custom ordering and sorting to the assignment list",
    },
    {
      command: "open-educoder homework common list MOAPGNLO --search 123 --status 0",
      description: "Search assignments by keyword",
    },
  ]),
  Command.withAlias("l"),
);
