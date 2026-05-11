import { Console, Effect } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../services/educoder-api/index.js";
import { inspectOptions } from "../utils/inspect-options.js";

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
const CourseId = Argument.string("course-id");

const printJson = (value: unknown) => Console.log(JSON.stringify(value, null, 2));

const resolveLogin = Effect.fn("course.resolveLogin")(function* () {
  const educoder = yield* EducoderApi;
  const user = yield* educoder.User.getInfo();

  return user.login;
});

const makeCourseRequest = (courseId: string, login: string) => ({
  params: {
    courseId,
  },
  query: {
    id: courseId,
    zzud: login,
  },
});

export const course = Command.make("course").pipe(
  Command.withAlias("c"),
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
          return yield* printJson(response);
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
          inspectOptions,
        );
      }),
    ).pipe(Command.withAlias("l")),
    Command.make(
      "info",
      {
        courseId: CourseId,
        json: Flag.boolean("json"),
      },
      Effect.fn("course.info")(function* (input) {
        const educoder = yield* EducoderApi;
        const login = yield* resolveLogin();
        const response = yield* educoder.Course.topBanner(makeCourseRequest(input.courseId, login));

        if (input.json) {
          return yield* printJson(response);
        }

        yield* Console.dir(
          {
            course: {
              id: response.course_id,
              name: response.name,
              teacher: response.teacher_name,
              teacherSchool: response.teacher_school,
              group: response.group_name,
              teachers: response.teacher_users,
              teacherCount: response.teacher_count,
              studentCount: response.student_count,
              groupCount: response.course_group_count,
              credit: response.credit,
              classPeriod: response.class_period,
              visits: response.visits,
              public: response.is_public,
              ended: response.course_end,
              inviteCode: response.show_invite_code ? response.invite_code : null,
              allowViewMessage: response.allow_view_message,
            },
          },
          inspectOptions,
        );
      }),
    ).pipe(Command.withAlias("i")),
    Command.make(
      "modules",
      {
        courseId: CourseId,
        json: Flag.boolean("json"),
      },
      Effect.fn("course.modules")(function* (input) {
        const educoder = yield* EducoderApi;
        const login = yield* resolveLogin();
        const response = yield* educoder.Course.leftBanner(makeCourseRequest(input.courseId, login));

        if (input.json) {
          return yield* printJson(response);
        }

        if (response.course_modules.length === 0) {
          return yield* Console.log("No modules found.");
        }

        yield* Console.dir(
          {
            modules: Object.fromEntries(
              response.course_modules.map((module) => [
                module.id,
                {
                  name: module.name,
                  type: module.type,
                  position: module.position,
                  url: module.category_url,
                  categories: Object.fromEntries(
                    (module.second_category ?? []).map((category) => [
                      category.category_id,
                      {
                        name: category.category_name,
                        position: category.position,
                        type: category.category_type,
                        url: category.second_category_url,
                      },
                    ]),
                  ),
                },
              ]),
            ),
          },
          inspectOptions,
        );
      }),
    ).pipe(Command.withAlias("m")),
  ]),
);
