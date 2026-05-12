import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import { AssignmentSortByChoices, CourseId, PositiveInteger, SortDirectionChoices } from "../../flags.js";
import { renderLabAssignments } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

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
    search: Flag.string("search").pipe(Flag.withDescription("Keyword to search in lab names."), Flag.optional),
    sortBy: Flag.choice("sort-by", AssignmentSortByChoices).pipe(
      Flag.withDescription("Field used to sort lab assignments."),
      Flag.optional,
    ),
    sortDirection: Flag.choice("sort-direction", SortDirectionChoices).pipe(
      Flag.withDescription("Sort direction."),
      Flag.optional,
    ),
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw lab assignment list as JSON.")),
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
  Command.withDescription("List lab assignments in a course and show assignment IDs for lab commands."),
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
