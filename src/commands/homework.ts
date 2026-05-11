import { Console, Effect, Option } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../services/educoder-api/index.js";
import { inspectOptions } from "../utils/inspect-options.js";

const HomeworkTypeChoices = ["common", "shixun"] as const;
const HomeworkSortByChoices = ["created_at", "updated_at", "name_pinyin"] as const;
const SortDirectionChoices = ["desc", "asc"] as const;
const HomeworkTypeCode = {
  common: 1,
  shixun: 4,
} as const;
const PositiveInteger = (name: string) =>
  Flag.integer(name).pipe(
    Flag.filter(
      (value) => value >= 1,
      (value) => `${name} must be greater than or equal to 1, got ${value}`,
    ),
  );
const CourseId = Argument.string("course-id");

const printJson = (value: unknown) => Console.log(JSON.stringify(value, null, 2));

const resolveLogin = Effect.fn("homework.resolveLogin")(function* () {
  const educoder = yield* EducoderApi;
  const user = yield* educoder.User.getInfo();

  return user.login;
});

const formatLabels = (labels: ReadonlyArray<string>) => labels.join(", ");

const formatOperation = (operation: ReadonlyArray<unknown> | undefined) => {
  const action = operation?.[0];
  const path = operation?.[1];
  const resumed = operation?.[2];

  return {
    action: typeof action === "string" ? action : null,
    path: typeof path === "string" ? path : null,
    resumed: typeof resumed === "boolean" ? resumed : null,
  };
};

export const homework = Command.make("homework").pipe(
  Command.withAlias("h"),
  Command.withSubcommands([
    Command.make(
      "list",
      {
        courseId: CourseId,
        type: Flag.choice("type", HomeworkTypeChoices),
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
            type: HomeworkTypeCode[input.type],
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
                  input.type === "shixun"
                    ? {
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
                      }
                    : {
                        ...base,
                        workId: item.work_id,
                        workStatus: item.work_status === undefined ? null : formatLabels(item.work_status),
                        uncommitted: item.un_commit_work,
                        labStatus: item.lab_status,
                      },
                ];
              }),
            ),
          },
          inspectOptions,
        );
      }),
    ).pipe(Command.withAlias("l")),
  ]),
);
