import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { CourseId, AssignmentSortByChoices, PositiveInteger, SortDirectionChoices } from "../../flags.js";
import { renderLabAssignments } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

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
    sortBy: Flag.choice("sort-by", AssignmentSortByChoices).pipe(Flag.optional),
    sortDirection: Flag.choice("sort-direction", SortDirectionChoices).pipe(Flag.optional),
    json: Flag.boolean("json"),
  },
  Effect.fn("assignments.labs.list")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.list({
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
      return yield* Console.log("No assignments found.");
    }

    yield* Console.log(renderLabAssignments(input.courseId, result.view));
  }),
).pipe(
  Command.withDescription("List lab assignments for a course category with optional filters and search."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs list 109348 --category 1213302",
      description: "List lab assignments in a category",
    },
    {
      command:
        "open-educoder assignments labs list 109348 --category 1213302 --sort-by name_pinyin --sort-direction desc",
      description: "Sort lab assignments by pinyin name",
    },
    {
      command: "open-educoder assignments labs list 109348 --category 1213302 --search 123 --status 7",
      description: "Search within the selected category",
    },
  ]),
  Command.withAlias("l"),
);
