import { Console, Effect, Option } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../../services/educoder-api/index.js";
import { CourseId, HomeworkSortByChoices, HomeworkTypeCode, PositiveInteger, SortDirectionChoices } from "../flags.js";
import { formatLabels, formatOperation, inspectOptions, printJson, resolveLogin } from "../shared.js";

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
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin();
    const order = Option.isSome(input.order) ? input.order.value : input.status;
    const search = Option.isSome(input.search) ? input.search.value : undefined;
    const sortBy = Option.isSome(input.sortBy) ? input.sortBy.value : undefined;
    const sortDirection = Option.isSome(input.sortDirection) ? input.sortDirection.value : undefined;
    const response = yield* educoder.Course.homeworkCommons({
      params: {
        courseId: input.courseId,
      },
      query: {
        coursesId: input.courseId,
        id: input.courseId,
        limit: input.limit,
        type: HomeworkTypeCode.shixun,
        status: input.status,
        category: Option.isSome(input.category) ? input.category.value : undefined,
        page: input.page,
        order,
        search,
        sort_by: sortBy,
        sort_direction: sortDirection,
        zzud: login,
      },
    });

    if (input.json) {
      return yield* printJson(response);
    }

    if (response.homeworks.length === 0) {
      return yield* Console.log("No homeworks found.");
    }

    yield* Console.dir(
      {
        filters: {
          status: input.status,
          order,
          search: search ?? null,
          sortBy: sortBy ?? null,
          sortDirection: sortDirection ?? null,
        },
        category: {
          id: response.category_id,
          name: response.category_name ?? response.main_category_name,
          total: response.query_total_count,
          published: response.published_count,
          unpublished: response.unpublished_count,
        },
        homeworks: Object.fromEntries(
          response.homeworks.map((item) => {
            const base = {
              name: item.name,
              category: item.upper_category_name ?? response.category_name,
              status: formatLabels(item.status),
              statusTime: item.status_time,
              timeStatus: item.time_status,
              allowLate: item.allow_late,
              author: item.author,
              created: item.created_at,
              publishTime: item.publish_time,
              endTime: item.end_time,
              lateTime: item.late_time,
              studentWorkId: item.student_work_id,
            };

            return [
              item.homework_id,
              {
                ...base,
                shixunIdentifier: item.shixun_identifier,
                myshixunIdentifier: item.myshixun_identifier,
                progress: {
                  finished: item.finished_challenge_count,
                  checked: item.checked_challenge_count,
                  total: item.challenge_count,
                },
                operation: formatOperation(item.task_operation),
                shixunStatus: item.shixun_finished_status,
              },
            ];
          }),
        ),
      },
      inspectOptions,
    );
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
