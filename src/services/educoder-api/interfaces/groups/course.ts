import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

const StringValue = Schema.String;
const IdFromString = Schema.NumberFromString.pipe(Schema.check(Schema.isInt()));
const TaskOperation = Schema.Tuple([
  Schema.String,
  Schema.String,
  Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
]);
const CourseRequestParams = {
  courseId: StringValue,
};
const CourseRequestQuery = {
  id: StringValue,
  zzud: StringValue,
};
/*
Sample: GET /api/courses/MOAPGNLO/left_banner.json
[
  {
    "root_id": 1809404,
    "name": "<module name>",
    "category_id": 1213301,
    "category_name": "<category name>",
    "position": 1,
    "category_type": "shixun_homework",
    "second_category_url": "/classrooms/MOAPGNLO/shixun_homework/1213301"
  },
  {
    "root_id": 1809412,
    "name": "<category name>"
  }
]
*/
const Category = Schema.Struct({
  root_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  name: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  category_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  category_name: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  position: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  category_type: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  second_category_url: Schema.optionalKey(Schema.NullishOr(Schema.String)),
});
/*
Sample: GET /api/courses/MOAPGNLO/homework_commons.json
{
  "homework_id": 3487339,
  "name": "<homework name>",
  "status": ["提交中"],
  "status_time": "<status text>",
  "time_status": 1,
  "allow_late": false,
  "author": "<author>",
  "created_at": "2026-02-27",
  "upper_category_name": null,
  "lab_status": "none",
  "work_id": 284732541,
  "work_status": ["提交作品"],
  "un_commit_work": true,
  "publish_time": "2026-05-10 08:30",
  "end_time": "2026-06-21 23:59",
  "late_time": "--",
  "student_work_id": 284732541
}
*/
const Homework = Schema.Struct({
  homework_id: Schema.Int,
  name: Schema.String,
  status: Schema.Array(Schema.String),
  status_time: Schema.String,
  time_status: Schema.Int,
  allow_late: Schema.Boolean,
  author: Schema.String,
  created_at: Schema.String,
  upper_category_name: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  lab_status: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  work_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  work_status: Schema.optionalKey(Schema.NullishOr(Schema.Array(Schema.String))),
  un_commit_work: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  shixun_identifier: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  task_operation: Schema.optionalKey(Schema.NullishOr(TaskOperation)),
  shixun_finished_status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  myshixun_identifier: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  publish_time: Schema.String,
  end_time: Schema.String,
  late_time: Schema.String,
  challenge_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  checked_challenge_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  finished_challenge_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  student_work_id: Schema.Int,
});
/*
Sample: GET /api/courses/MOAPGNLO/homework_commons.json
{
  "course_identity": 5,
  "homework_type": 1,
  "course_public": false,
  "is_end": false,
  "main_category_id": 1809406,
  "main_category_name": "<main category>",
  "category_id": null,
  "category_name": null,
  "homeworks": ["<Homework>"],
  "all_count": 8,
  "published_count": 6,
  "unpublished_count": 2,
  "query_total_count": 6
}
*/
const HomeworkCommonsResponse = Schema.Struct({
  main_category_name: Schema.String,
  category_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  category_name: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  homeworks: Schema.Array(Homework),
  published_count: Schema.Int,
  unpublished_count: Schema.Int,
  query_total_count: Schema.Int,
});
/*
Sample: GET /api/v2/courses/MOAPGNLO/exercises.json
{
  "id": 198086,
  "exercise_name": "<exercise name>",
  "created_at": "2026-03-02T18:40:03.000+08:00",
  "screen_open": false,
  "is_locked": false,
  "is_random": true,
  "exercise_tips": ["已截止"],
  "current_status": 1,
  "exercise_left_time": null,
  "time": 120,
  "whole_exercise_status": 3,
  "exercise_status": 3,
  "exercise_user_id": 30415309,
  "commit_method": "countdown_auto",
  "author": "<author>"
}

No-time-limit sample:
{
  "id": 198087,
  "exercise_name": "<exercise name>",
  "time": null,
  ...
}
*/
const ExerciseSummary = Schema.Struct({
  id: Schema.Int,
  exercise_name: Schema.String,
  created_at: Schema.String,
  screen_open: Schema.Boolean,
  is_locked: Schema.Boolean,
  is_random: Schema.Boolean,
  exercise_tips: Schema.optionalKey(Schema.NullishOr(Schema.Array(Schema.String))),
  current_status: Schema.Int,
  exercise_left_time: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  time: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  whole_exercise_status: Schema.Int,
  exercise_status: Schema.Int,
  exercise_user_id: Schema.Int,
  commit_method: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  author: Schema.optionalKey(Schema.NullishOr(Schema.String)),
});

export const Course = HttpApiGroup.make("Course")
  .add(
    HttpApiEndpoint.get("list", "/api/users/:username/courses.json", {
      params: {
        username: StringValue,
      },
      query: {
        category: Schema.optionalKey(Schema.NullishOr(Schema.String)),
        status: Schema.optionalKey(Schema.NullishOr(Schema.Literals(["processing", "end"]))), // omitted = all
        page: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        per_page: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        sort_by: Schema.Literals(["updated_at", "created_at", "name"]),
        sort_direction: Schema.Literals(["desc", "asc"]),
        username: StringValue,
        zzud: StringValue,
      },
      /*
      Sample: GET /api/users/pl2kfhv6g/courses.json
      {
        "count": 2,
        "courses": [
          {
            "id": 109348,
            "name": "<course name>",
            "members_count": 1127,
            "homework_commons_count": 8,
            "attachments_count": 0,
            "visits": 42732,
            "school": "<school>",
            "created_at": "2026-02-27",
            "is_end": false,
            "teacher": {
              "real_name": "<teacher>"
            }
          }
        ]
      }
      */
      success: Schema.Struct({
        count: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(0))),
        courses: Schema.Array(
          Schema.Struct({
            id: Schema.Int,
            name: Schema.String,
            members_count: Schema.Int,
            homework_commons_count: Schema.Int,
            attachments_count: Schema.Int,
            visits: Schema.Int,
            school: Schema.String,
            created_at: Schema.String,
            is_end: Schema.Boolean,
            teacher: Schema.Struct({
              real_name: Schema.String,
            }),
          }),
        ),
      }),
    }),
  )
  .add(
    HttpApiEndpoint.get("topBanner", "/api/courses/:courseId/top_banner.json", {
      params: CourseRequestParams,
      query: CourseRequestQuery,
      /*
      Sample: GET /api/courses/MOAPGNLO/top_banner.json
      {
        "name": "<course name>",
        "teacher_name": "<teacher>",
        "allow_view_message": true,
        "teacher_school": "<school>",
        "is_public": false,
        "teacher_users": ["<teacher>"],
        "group_name": "<group>",
        "teacher_count": 16,
        "student_count": 1127,
        "course_group_count": 18,
        "credit": 3.5,
        "course_id": 109348,
        "class_period": 64,
        "course_end": false,
        "show_invite_code": false,
        "invite_code": "PH4CJ",
        "visits": 42709
      }
      */
      success: Schema.Struct({
        name: Schema.String,
        teacher_name: Schema.String,
        allow_view_message: Schema.Boolean,
        teacher_school: Schema.String,
        is_public: Schema.Boolean,
        teacher_users: Schema.Array(Schema.String),
        group_name: Schema.String,
        teacher_count: Schema.Int,
        student_count: Schema.Int,
        course_group_count: Schema.Int,
        credit: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
        course_id: Schema.Int,
        class_period: Schema.Int,
        course_end: Schema.Boolean,
        show_invite_code: Schema.Boolean,
        invite_code: Schema.optionalKey(Schema.NullishOr(Schema.String)),
        visits: Schema.Int,
      }),
    }),
  )
  .add(
    HttpApiEndpoint.get("leftBanner", "/api/courses/:courseId/left_banner.json", {
      params: CourseRequestParams,
      query: CourseRequestQuery,
      /*
      Sample: GET /api/courses/MOAPGNLO/left_banner.json
      {
        "is_teacher": false,
        "course_modules": [
          {
            "id": 1809404,
            "name": "<module name>",
            "type": "shixun_homework",
            "position": 2,
            "category_url": "/classrooms/MOAPGNLO/shixun_homework",
            "second_category": ["<Category>"]
          }
        ]
      }
      */
      success: Schema.Struct({
        is_teacher: Schema.Boolean,
        course_modules: Schema.Array(
          Schema.Struct({
            id: Schema.Int,
            name: Schema.String,
            type: Schema.String,
            position: Schema.Int,
            category_url: Schema.optionalKey(Schema.NullishOr(Schema.String)),
            second_category: Schema.optionalKey(Schema.NullishOr(Schema.Array(Category))),
          }),
        ),
      }),
    }),
  )
  .add(
    HttpApiEndpoint.get("homeworkCommons", "/api/courses/:courseId/homework_commons.json", {
      params: CourseRequestParams,
      query: {
        coursesId: Schema.optionalKey(Schema.NullishOr(StringValue)),
        id: StringValue,
        limit: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        type: Schema.Int,
        status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
        category: Schema.optionalKey(Schema.NullishOr(IdFromString)),
        page: Schema.optionalKey(Schema.NullishOr(Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))))),
        order: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
        search: Schema.optionalKey(Schema.NullishOr(Schema.String)),
        sort_by: Schema.optionalKey(
          Schema.NullishOr(Schema.Literals(["created_at", "updated_at", "name_pinyin", "position"])),
        ),
        sort_direction: Schema.optionalKey(Schema.NullishOr(Schema.Literals(["asc", "desc"]))),
        zzud: StringValue,
      },
      success: HomeworkCommonsResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("exercises", "/api/v2/courses/:courseId/exercises.json", {
      params: CourseRequestParams,
      query: {
        coursesId: StringValue,
        limit: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        type: Schema.String,
        id: StringValue,
        page: Schema.optionalKey(Schema.NullishOr(Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))))),
        zzud: StringValue,
      },
      /*
      Sample: GET /api/v2/courses/MOAPGNLO/exercises.json
      {
        "status": 0,
        "message": "响应成功",
        "total_count": 6,
        "exercises_counts": {
          "exercises_all_counts": 6
        },
        "exercises": ["<ExerciseSummary>"]
      }
      */
      success: Schema.Struct({
        status: Schema.Int,
        message: Schema.String,
        total_count: Schema.Int,
        exercises_counts: Schema.Struct({
          exercises_all_counts: Schema.Int,
        }),
        exercises: Schema.Array(ExerciseSummary),
      }),
    }),
  );
