import { Context, Effect, Layer } from "effect";

import { AppContext } from "../context/index.js";
import { EducoderApi } from "../educoder-api/index.js";
import { type EducoderApiResponse, type FeatureWorkflow } from "./shared.js";

export const CourseStatusChoices = ["processing", "end", "all"] as const;
export const CourseSortByChoices = ["updated_at", "created_at", "name"] as const;
export const SortDirectionChoices = ["desc", "asc"] as const;

export type CourseStatus = (typeof CourseStatusChoices)[number];
export type CourseSortBy = (typeof CourseSortByChoices)[number];
export type SortDirection = (typeof SortDirectionChoices)[number];

const makeCourseRequest = (courseId: string, login: string) => ({
  params: {
    courseId,
  },
  query: {
    id: courseId,
    zzud: login,
  },
});

type ListCoursesInput = {
  readonly status: CourseStatus;
  readonly page: number;
  readonly perPage: number;
  readonly sortBy: CourseSortBy;
  readonly sortDirection: SortDirection;
  readonly category?: string | undefined;
};

type CourseIdInput = {
  readonly courseId: string;
};

type ListCoursesRaw = EducoderApiResponse<"Course", "list">;
type CourseInfoRaw = EducoderApiResponse<"Course", "topBanner">;
type CourseModulesRaw = EducoderApiResponse<"Course", "leftBanner">;

type ListCoursesView = {
  readonly total: number;
  readonly courses: Record<
    string,
    {
      readonly name: string;
      readonly school: string;
      readonly teacher: string;
      readonly members: number;
      readonly assignments: number;
      readonly attachments: number;
      readonly visits: number;
      readonly status: "end" | "processing";
      readonly created: string;
    }
  >;
};

type CourseInfoView = {
  readonly course: {
    readonly id: number;
    readonly name: string;
    readonly teacher: string;
    readonly teacherSchool: string;
    readonly group: string;
    readonly teachers: ReadonlyArray<string>;
    readonly teacherCount: number;
    readonly studentCount: number;
    readonly groupCount: number;
    readonly credit: number | null;
    readonly classPeriod: number;
    readonly visits: number;
    readonly public: boolean;
    readonly ended: boolean;
    readonly inviteCode: string | null;
    readonly allowViewMessage: boolean;
  };
};

type CourseModulesView = {
  readonly modules: Record<
    string,
    {
      readonly name: string;
      readonly type: string;
      readonly position: number;
      readonly url: string | null;
      readonly categories: Record<
        string,
        {
          readonly name: string;
          readonly position: number | null;
          readonly type: string | null;
          readonly url: string | null;
        }
      >;
    }
  >;
};

export type CourseFeatureShape = {
  readonly list: FeatureWorkflow<ListCoursesInput, ListCoursesRaw, ListCoursesView>;
  readonly getInfo: FeatureWorkflow<CourseIdInput, CourseInfoRaw, CourseInfoView>;
  readonly listModules: FeatureWorkflow<CourseIdInput, CourseModulesRaw, CourseModulesView>;
};

export class CourseFeature extends Context.Service<CourseFeature, CourseFeatureShape>()(
  "open-educoder/services/features/CourseFeature",
) {
  public static readonly layer = Layer.effect(
    CourseFeature,
    Effect.gen(function* () {
      const ctx = yield* AppContext;
      const educoder = yield* EducoderApi;

      const resolveLogin = Effect.fn("features.course.resolveLogin")(function* () {
        const user = yield* ctx.user;

        return user.login;
      });

      const list: CourseFeatureShape["list"] = Effect.fn("features.course.list")(function* (input) {
        const login = yield* resolveLogin();
        const status = input.status === "all" ? undefined : input.status;
        const category = input.category === undefined || input.category === "" ? undefined : input.category;
        const raw = yield* educoder.Course.list({
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

        return {
          raw,
          view: {
            total: raw.count,
            courses: Object.fromEntries(
              raw.courses.map((course) => [
                course.id,
                {
                  name: course.name,
                  school: course.school,
                  teacher: course.teacher.real_name,
                  members: course.members_count,
                  assignments: course.homework_commons_count,
                  attachments: course.attachments_count,
                  visits: course.visits,
                  status: course.is_end ? "end" : "processing",
                  created: course.created_at,
                },
              ]),
            ),
          },
        };
      });

      const getInfo: CourseFeatureShape["getInfo"] = Effect.fn("features.course.info")(function* (input) {
        const login = yield* resolveLogin();
        const raw = yield* educoder.Course.topBanner(makeCourseRequest(input.courseId, login));

        return {
          raw,
          view: {
            course: {
              id: raw.course_id,
              name: raw.name,
              teacher: raw.teacher_name,
              teacherSchool: raw.teacher_school,
              group: raw.group_name,
              teachers: raw.teacher_users,
              teacherCount: raw.teacher_count,
              studentCount: raw.student_count,
              groupCount: raw.course_group_count,
              credit: raw.credit ?? null,
              classPeriod: raw.class_period,
              visits: raw.visits,
              public: raw.is_public,
              ended: raw.course_end,
              inviteCode: raw.show_invite_code ? (raw.invite_code ?? null) : null,
              allowViewMessage: raw.allow_view_message,
            },
          },
        };
      });

      const listModules: CourseFeatureShape["listModules"] = Effect.fn("features.course.modules")(function* (input) {
        const login = yield* resolveLogin();
        const raw = yield* educoder.Course.leftBanner(makeCourseRequest(input.courseId, login));

        return {
          raw,
          view: {
            modules: Object.fromEntries(
              raw.course_modules.map((module) => [
                module.id,
                {
                  name: module.name,
                  type: module.type,
                  position: module.position,
                  url: module.category_url ?? null,
                  categories: Object.fromEntries(
                    (module.second_category ?? []).map((category) => [
                      String(category.category_id ?? category.category_name ?? category.root_id ?? category.name ?? ""),
                      {
                        name: category.category_name ?? category.name ?? "",
                        position: category.position ?? null,
                        type: category.category_type ?? null,
                        url: category.second_category_url ?? null,
                      },
                    ]),
                  ),
                },
              ]),
            ),
          },
        };
      });

      return CourseFeature.of({
        list,
        getInfo,
        listModules,
      });
    }),
  );
}
