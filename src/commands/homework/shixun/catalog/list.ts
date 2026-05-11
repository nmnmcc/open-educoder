import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { CourseId, HomeworkSortByChoices, PositiveInteger, SortDirectionChoices } from "../../flags.js";
import { inspectOptions, optionToUndefined, printJson } from "../../shared.js";

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
  Effect.fn("homework.shixun.list")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.list({
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
      return yield* Console.log("No homeworks found.");
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("List shixun homeworks with the filters Educoder uses in the homework page."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun list MOAPGNLO --category 1213302",
      description: "List shixun homeworks from a category",
    },
    {
      command:
        "open-educoder homework shixun list MOAPGNLO --category 1213302 --sort-by name_pinyin --sort-direction desc",
      description: "Sort the homework list by name",
    },
    {
      command: "open-educoder homework shixun list MOAPGNLO --category 1213302 --search 123 --status 7",
      description: "Search within a homework category",
    },
  ]),
  Command.withAlias("l"),
);
