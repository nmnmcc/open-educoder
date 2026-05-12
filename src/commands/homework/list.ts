import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkCommonFeature } from "../../services/features/homework/common.js";
import { HomeworkShixunFeature } from "../../services/features/homework/shixun.js";
import { CourseId, HomeworkSortByChoices, PositiveInteger, SortDirectionChoices } from "./flags.js";
import { renderCommonHomeworks, renderShixunHomeworks } from "./render.js";
import { optionToUndefined, printJson } from "./shared.js";

const HomeworkListTypeChoices = ["common", "shixun", "all"] as const;

export const List = Command.make(
  "list",
  {
    courseId: CourseId,
    type: Flag.choice("type", HomeworkListTypeChoices).pipe(Flag.withDefault("all")),
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
  Effect.fn("homework.list")(function* (input) {
    const commonFeature = yield* HomeworkCommonFeature;
    const shixunFeature = yield* HomeworkShixunFeature;
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
    const shixun = input.type === "shixun" || input.type === "all" ? yield* shixunFeature.list(request) : null;

    if (input.json) {
      return yield* printJson({
        common: common?.raw ?? null,
        shixun: shixun?.raw ?? null,
      });
    }

    const sections = [
      common === null ? null : renderCommonHomeworks(input.courseId, common.view),
      shixun === null ? null : renderShixunHomeworks(input.courseId, shixun.view),
    ].filter((section): section is string => section !== null && section.length >= 1);

    yield* Console.log(sections.length >= 1 ? sections.join("\n\n") : "没有作业 / No homeworks found.");
  }),
).pipe(
  Command.withDescription("List common and shixun homework with explicit bilingual ID labels."),
  Command.withExamples([
    {
      command: "open-educoder homework list 109348 --type all",
      description: "List all homework types and show copyable next commands",
    },
    {
      command: "open-educoder h l 109348 --type shixun --limit 5",
      description: "List shixun homework only",
    },
  ]),
  Command.withAlias("l"),
);
