import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../services/educoder-api/index.js";

const StatusChoices = ["processing", "end", "all"] as const;
const SortByChoices = ["updated_at", "created_at", "name"] as const;
const SortDirectionChoices = ["desc", "asc"] as const;
const PositiveInteger = (name: string) =>
  Flag.integer(name).pipe(
    Flag.filter(
      (value) => value >= 1,
      (value) => `${name} must be greater than or equal to 1, got ${value}`,
    ),
  );

export const course = Command.make("course").pipe(
  Command.withSubcommands([
    Command.make(
      "list",
      {
        status: Flag.choice("status", StatusChoices).pipe(Flag.withDefault("processing")),
        page: PositiveInteger("page").pipe(Flag.withDefault(1)),
        perPage: PositiveInteger("per-page").pipe(Flag.withDefault(15)),
        sortBy: Flag.choice("sort-by", SortByChoices).pipe(Flag.withDefault("updated_at")),
        sortDirection: Flag.choice("sort-direction", SortDirectionChoices).pipe(Flag.withDefault("desc")),
        category: Flag.string("category").pipe(Flag.withDefault("")),
        json: Flag.boolean("json"),
      },
      Effect.fn("course.list")(function* (input) {
        const educoder = yield* EducoderApi;
        const user = yield* educoder.User.getInfo();
        const login = user.login;
        const status = input.status === "all" ? undefined : input.status;
        const category = input.category === "" ? undefined : input.category;

        const response = yield* educoder.Course.list({
          params: {
            username: login,
          },
          query: {
            category,
            status,
            page: input.page,
            per_page: input.perPage,
            sort_by: input.sortBy,
            sort_direction: input.sortDirection,
            username: login,
            zzud: login,
          },
        });

        if (input.json) {
          return yield* Console.log(JSON.stringify(response, null, 2));
        }

        if (response.courses.length === 0) {
          return yield* Console.log("No courses found.");
        }

        yield* Console.dir(
          {
            courses: Object.fromEntries(
              response.courses.map((course) => [
                course.id,
                {
                  name: course.name,
                  school: course.school,
                  teacher: course.teacher.real_name,
                  members: course.members_count,
                  homeworks: course.homework_commons_count,
                  attachments: course.attachments_count,
                  visits: course.visits,
                  status: course.is_end ? "end" : "processing",
                  created: course.created_at,
                },
              ]),
            ),
          },
          { colors: true, depth: null },
        );
      }),
    ),
  ]),
);
