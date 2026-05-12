import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { CommonAssignmentFeature } from "../../../services/features/assignments/common.js";
import { AssignmentSortByChoices, CourseId, PositiveInteger, SortDirectionChoices } from "../flags.js";
import { renderCommonAssignments } from "../render.js";
import { optionToUndefined, printJson } from "../shared.js";

export const List = Command.make(
  "list",
  {
    courseId: CourseId,
    category: PositiveInteger("category").pipe(
      Flag.withDescription("Course module category ID from `courses modules`."),
      Flag.optional,
    ),
    status: Flag.integer("status").pipe(Flag.withDescription("Educoder assignment status code."), Flag.withDefault(0)),
    page: PositiveInteger("page").pipe(Flag.withDescription("Page number to fetch."), Flag.withDefault(1)),
    limit: PositiveInteger("limit").pipe(Flag.withDescription("Assignments per page."), Flag.withDefault(20)),
    order: Flag.integer("order").pipe(
      Flag.withDescription("Educoder ordering code to pass through to the list API."),
      Flag.optional,
    ),
    search: Flag.string("search").pipe(Flag.withDescription("Keyword to search in assignment names."), Flag.optional),
    sortBy: Flag.choice("sort-by", AssignmentSortByChoices).pipe(
      Flag.withDescription("Field used to sort common assignments."),
      Flag.optional,
    ),
    sortDirection: Flag.choice("sort-direction", SortDirectionChoices).pipe(
      Flag.withDescription("Sort direction."),
      Flag.optional,
    ),
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw common assignment list as JSON.")),
  },
  Effect.fn("assignments.common.list")(function* (input) {
    const commonAssignmentFeature = yield* CommonAssignmentFeature;
    const result = yield* commonAssignmentFeature.list({
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
      return yield* Console.log("No common assignments found.");
    }

    yield* Console.log(renderCommonAssignments(input.courseId, result.view));
  }),
).pipe(
  Command.withDescription("List common assignments in a course and show IDs for detail commands."),
  Command.withExamples([
    {
      command: "open-educoder assignments common list 109348 --sort-by position --sort-direction desc",
      description: "Sort by category position and order descending",
    },
    {
      command: "open-educoder assignments common list 109348 --sort-by updated_at --sort-direction asc --order 7",
      description: "Apply custom ordering and sorting to the assignment list",
    },
    {
      command: "open-educoder assignments common list 109348 --search 123 --status 0",
      description: "Search assignments by keyword",
    },
  ]),
  Command.withAlias("l"),
);
