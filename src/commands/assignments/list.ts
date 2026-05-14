import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { CommonAssignmentFeature } from "../../services/features/assignments/common.js";
import { LabAssignmentFeature } from "../../services/features/assignments/lab.js";
import { AssignmentSortByChoices, CourseId, PositiveInteger, SortDirectionChoices } from "./flags.js";
import { renderCommonAssignments, renderLabAssignments } from "./render.js";
import { optionToUndefined, printJson } from "./shared.js";

const AssignmentListTypeChoices = ["common", "lab", "all"] as const;

export const List = Command.make(
  "list",
  {
    courseId: CourseId,
    type: Flag.choice("type", AssignmentListTypeChoices).pipe(
      Flag.withDescription("Assignment type to list: common, lab, or all."),
      Flag.withDefault("all"),
    ),
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
      Flag.withDescription("Field used to sort assignments."),
      Flag.optional,
    ),
    sortDirection: Flag.choice("sort-direction", SortDirectionChoices).pipe(
      Flag.withDescription("Sort direction."),
      Flag.optional,
    ),
    json: Flag.boolean("json").pipe(Flag.withDescription("Print raw common/lab responses as JSON.")),
  },
  Effect.fn("assignments.list")(function* (input) {
    const commonFeature = yield* CommonAssignmentFeature;
    const labFeature = yield* LabAssignmentFeature;
    const request = {
      courseId: input.courseId,
      category: optionToUndefined(input.category),
      status: input.status,
      page: input.page,
      limit: input.limit,
      order: optionToUndefined(input.order),
      search: optionToUndefined(input.search),
      sortBy: optionToUndefined(input.sortBy),
      sortDirection: optionToUndefined(input.sortDirection),
    };
    const common = input.type === "common" || input.type === "all" ? yield* commonFeature.list(request) : null;
    const lab = input.type === "lab" || input.type === "all" ? yield* labFeature.list(request) : null;

    if (input.json) {
      return yield* printJson({
        common: common?.raw ?? null,
        lab: lab?.raw ?? null,
      });
    }

    const sections = [
      common === null ? null : renderCommonAssignments(input.courseId, common.view),
      lab === null ? null : renderLabAssignments(input.courseId, lab.view),
    ].filter((section): section is string => section !== null && section.length >= 1);

    yield* Console.log(sections.length >= 1 ? sections.join("\n\n") : "没有作业 / No assignments found.");
  }),
).pipe(
  Command.withDescription("List assignments in a course and show IDs with next command templates."),
  Command.withExamples([
    {
      command: "open-educoder assignments list 109348 --type all",
      description: "List all assignment types and show copyable next commands",
    },
    {
      command: "open-educoder a l 109348 --type lab --limit 5",
      description: "List lab assignments only",
    },
  ]),
  Command.withAlias("l"),
);
