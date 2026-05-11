import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

const NonEmptyString = Schema.String.pipe(Schema.check(Schema.isMinLength(1)));
const IdFromString = Schema.NumberFromString.pipe(Schema.check(Schema.isInt()));
const NullableString = Schema.NullishOr(Schema.String);
const NullableNumber = Schema.NullishOr(Schema.Number);
const NullableBoolean = Schema.NullishOr(Schema.Boolean);
const JsonArray = Schema.Array(Schema.Json);
const CourseRequestParams = {
  courseId: NonEmptyString,
};
const CourseRequestQuery = {
  id: NonEmptyString,
  zzud: NonEmptyString,
};
/*
.sample/course2.har: GET /api/courses/MOAPGNLO/left_banner.json
{
  "root_id": 1809404,
  "name": "<module name>",
  "category_id": 1213301,
  "category_name": "<category name>",
  "position": 1,
  "category_type": "shixun_homework",
  "second_category_url": "/classrooms/MOAPGNLO/shixun_homework/1213301",
  "third_category": []
}
*/
const Category = Schema.Struct({
  root_id: Schema.optionalKey(Schema.Int),
  name: Schema.optionalKey(Schema.String),
  category_id: Schema.Int,
  category_name: Schema.String,
  position: Schema.optionalKey(Schema.Int),
  category_type: Schema.optionalKey(Schema.String),
  second_category_url: Schema.optionalKey(Schema.String),
  third_category: Schema.optionalKey(JsonArray),
});
/*
.sample/course2.har: GET /api/courses/MOAPGNLO/homework_commons.json
{
  "is_archive": false,
  "related_poll": false,
  "is_shixun": false,
  "homework_id": 3487339,
  "can_view_details": false,
  "name": "<homework name>",
  "private_icon": true,
  "status": ["提交中"],
  "status_time": "<status text>",
  "time_status": 1,
  "allow_late": false,
  "author": "<author>",
  "author_img": "avatars/User/317512?t=1734234539",
  "author_login": "p4wehmpso",
  "created_at": "2026-02-27",
  "unified_setting": true,
  "upper_category_name": null,
  "position": 0,
  "publish_immediately": false,
  "end_immediately": false,
  "open_evaluate": null,
  "lab_status": "none",
  "work_id": 284732541,
  "work_status": ["提交作品"],
  "un_commit_work": true,
  "publish_time": "2026-05-10 08:30",
  "end_time": "2026-06-21 23:59",
  "late_time": "--",
  "end_time_s": "2026-06-21 23:59:00",
  "student_work_id": 284732541
}
*/
const Homework = Schema.Struct({
  is_archive: Schema.optionalKey(Schema.Boolean),
  related_poll: Schema.optionalKey(Schema.Boolean),
  is_shixun: Schema.Boolean,
  homework_id: Schema.Int,
  can_view_details: Schema.optionalKey(Schema.Boolean),
  name: Schema.String,
  private_icon: Schema.optionalKey(Schema.Boolean),
  status: Schema.Array(Schema.String),
  status_time: Schema.String,
  time_status: Schema.Int,
  allow_late: Schema.Boolean,
  author: Schema.String,
  author_img: Schema.optionalKey(Schema.String),
  author_login: Schema.optionalKey(Schema.String),
  created_at: Schema.String,
  unified_setting: Schema.Boolean,
  upper_category_name: Schema.optionalKey(NullableString),
  position: Schema.optionalKey(Schema.Int),
  publish_immediately: Schema.optionalKey(Schema.Boolean),
  end_immediately: Schema.optionalKey(Schema.Boolean),
  open_evaluate: Schema.optionalKey(NullableBoolean),
  lab_status: Schema.optionalKey(Schema.String),
  work_id: Schema.optionalKey(Schema.Int),
  work_status: Schema.optionalKey(Schema.Array(Schema.String)),
  un_commit_work: Schema.optionalKey(Schema.Boolean),
  shixun_identifier: Schema.optionalKey(Schema.String),
  shixun_status: Schema.optionalKey(Schema.Int),
  shixun_name: Schema.optionalKey(Schema.String),
  schools: Schema.optionalKey(JsonArray),
  opening_time: Schema.optionalKey(NullableString),
  is_enter_shixun: Schema.optionalKey(Schema.Boolean),
  shixun_enter_status: Schema.optionalKey(Schema.Int),
  shixun_marks: Schema.optionalKey(JsonArray),
  redo: Schema.optionalKey(Schema.Boolean),
  task_operation: Schema.optionalKey(JsonArray),
  shixun_finished_status: Schema.optionalKey(Schema.Int),
  student_passed_time: Schema.optionalKey(Schema.String),
  is_jupyter: Schema.optionalKey(Schema.Boolean),
  is_jupyter_lab: Schema.optionalKey(Schema.Boolean),
  myshixun_identifier: Schema.optionalKey(NullableString),
  publish_time: Schema.String,
  end_time: Schema.String,
  late_time: Schema.String,
  end_time_s: Schema.String,
  challenge_count: Schema.optionalKey(Schema.Int),
  checked_challenge_count: Schema.optionalKey(Schema.Int),
  finished_challenge_count: Schema.optionalKey(Schema.Int),
  student_work_id: Schema.Int,
});
/*
.sample/course2.har: GET /api/courses/MOAPGNLO/homework_commons.json
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
  "task_count": 6,
  "query_total_count": 6,
  "archive_count": 0,
  "challenge_count": 0,
  "finished_challenge_count": 0,
  "finished_task_count": 0,
  "min_finished_game": null,
  "shixun_total_count": 6
}
*/
const HomeworkCommonsResponse = Schema.Struct({
  course_identity: Schema.Int,
  homework_type: Schema.Int,
  course_public: Schema.Boolean,
  is_end: Schema.Boolean,
  main_category_id: Schema.Int,
  main_category_name: Schema.String,
  category_id: Schema.NullishOr(Schema.Int),
  category_name: NullableString,
  homeworks: Schema.Array(Homework),
  all_count: Schema.Int,
  published_count: Schema.Int,
  unpublished_count: Schema.Int,
  task_count: Schema.Int,
  query_total_count: Schema.Int,
  archive_count: Schema.Int,
  challenge_count: Schema.Int,
  finished_challenge_count: Schema.Int,
  finished_task_count: Schema.Int,
  min_finished_game: NullableNumber,
  shixun_total_count: Schema.Int,
});
/*
.sample/course2.har: GET /api/v2/courses/MOAPGNLO/exercises.json
{
  "id": 198086,
  "exercise_name": "<exercise name>",
  "created_at": "2026-03-02T18:40:03.000+08:00",
  "last_times": 1,
  "screen_open": false,
  "screen_num": 3,
  "is_locked": false,
  "is_random": true,
  "ip_limit": "no",
  "ip_bind": false,
  "answered_open": false,
  "identity_verify": false,
  "is_make_up_exercise": false,
  "open_phone_video_recording": false,
  "exercise_type": 1,
  "simulate_exercise_num": 3,
  "ai_push_wrong_question": false,
  "is_encrypt": false,
  "current_user_created": false,
  "show_setting_tips": false,
  "is_normal": true,
  "exercise_tips": ["已截止"],
  "current_status": 1,
  "exercise_left_time": null,
  "time": 120,
  "whole_exercise_status": 3,
  "exercise_status": 3,
  "exercise_user_id": 30415309,
  "screen_total_num": 3,
  "screen_used_num": 0,
  "user_simulate_num": 0,
  "commit_method": "countdown_auto",
  "author": "<author>",
  "is_redo": 0,
  "before_start": "",
  "off_limits": false,
  "open_appraise": false
}
*/
const ExerciseSummary = Schema.Struct({
  id: Schema.Int,
  exercise_name: Schema.String,
  created_at: Schema.String,
  last_times: Schema.Int,
  screen_open: Schema.Boolean,
  screen_num: Schema.Int,
  is_locked: Schema.Boolean,
  is_random: Schema.Boolean,
  ip_limit: Schema.String,
  ip_bind: Schema.Boolean,
  answered_open: Schema.Boolean,
  identity_verify: Schema.Boolean,
  is_make_up_exercise: Schema.Boolean,
  open_phone_video_recording: Schema.Boolean,
  exercise_type: Schema.Int,
  simulate_exercise_num: Schema.Int,
  ai_push_wrong_question: Schema.Boolean,
  is_encrypt: Schema.Boolean,
  current_user_created: Schema.Boolean,
  show_setting_tips: Schema.Boolean,
  is_normal: Schema.Boolean,
  exercise_tips: Schema.Array(Schema.String),
  current_status: Schema.Int,
  exercise_left_time: NullableString,
  time: Schema.Int,
  whole_exercise_status: Schema.Int,
  exercise_status: Schema.Int,
  exercise_user_id: Schema.Int,
  screen_total_num: Schema.Int,
  screen_used_num: Schema.Int,
  user_simulate_num: Schema.Int,
  commit_method: Schema.String,
  author: Schema.String,
  is_redo: Schema.Int,
  before_start: Schema.String,
  off_limits: Schema.Boolean,
  open_appraise: Schema.Boolean,
});

export const Course = HttpApiGroup.make("Course")
  .add(
    HttpApiEndpoint.get("list", "/api/users/:username/courses.json", {
      params: {
        username: NonEmptyString,
      },
      query: {
        category: Schema.NullishOr(Schema.String),
        status: Schema.NullishOr(Schema.Literals(["processing", "end"])), // omitted = all
        page: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        per_page: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        sort_by: Schema.Literals(["updated_at", "created_at", "name"]),
        sort_direction: Schema.Literals(["desc", "asc"]),
        username: NonEmptyString,
        zzud: NonEmptyString,
      },
      /*
      .sample: no captured /api/users/:username/courses.json response.
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
            teacher_users: Schema.Array(Schema.String),
            created_at: Schema.String,
            is_end: Schema.Boolean,
            subject_id: Schema.NullishOr(Schema.String),
            subject_identifier: Schema.NullishOr(Schema.String),
            first_category_url: Schema.String,
            first_category: Schema.Struct({
              module_type: Schema.String,
              id: Schema.Int,
            }),
            is_public: Schema.BooleanFromBit,
            can_visited: Schema.Boolean,
            teacher: Schema.Struct({
              id: Schema.Int,
              real_name: Schema.String,
              avatar_url: Schema.String,
              school_name: Schema.String,
            }),
            forbid_visit_info: Schema.Struct({
              forbid_student_visit: Schema.Boolean,
              username: Schema.String,
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
      .sample/course2.har: GET /api/courses/MOAPGNLO/top_banner.json
      {
        "copy_completed": true,
        "is_natural_language_data": false,
        "name": "<course name>",
        "teacher_name": "<teacher>",
        "allow_view_message": true,
        "allow_apply_teacher": false,
        "copy_teacher_name": "<teacher>",
        "teacher_login": "p85shgelb",
        "teacher_img": "avatars/User/2137897?t=1736177014",
        "teacher_school": "<school>",
        "is_public": false,
        "student_join_approve": false,
        "student_join_pro": false,
        "show_unstart_exercise": false,
        "forbid_end_exercise": false,
        "switch_to_student": false,
        "switch_to_teacher": false,
        "switch_to_assistant": false,
        "teacher_users": ["<teacher>"],
        "group_name": "<group>",
        "teacher_count": 16,
        "student_count": 1127,
        "course_group_count": 18,
        "credit": 3.5,
        "course_id": 109348,
        "sub_discipline_id": null,
        "discipline_id": null,
        "class_period": 64,
        "course_end": false,
        "start_date": null,
        "deadline": null,
        "code_halt": false,
        "show_invite_code": false,
        "invite_code": "PH4CJ",
        "invite_code_halt": 0,
        "visits": 42709,
        "course_identity": 5,
        "excellent": false,
        "subject_identifier": "",
        "third_party_name": null,
        "third_party_tip": false,
        "third_part_login_url": "",
        "need_third_part_logined": false,
        "mooc_user_id": null,
        "mooc_course_id": null,
        "featured": false,
        "is_import_student": false
      }
      */
      success: Schema.Struct({
        copy_completed: Schema.Boolean,
        is_natural_language_data: Schema.Boolean,
        name: Schema.String,
        teacher_name: Schema.String,
        allow_view_message: Schema.Boolean,
        allow_apply_teacher: Schema.Boolean,
        copy_teacher_name: Schema.String,
        teacher_login: Schema.String,
        teacher_img: Schema.String,
        teacher_school: Schema.String,
        is_public: Schema.Boolean,
        student_join_approve: Schema.Boolean,
        student_join_pro: Schema.Boolean,
        show_unstart_exercise: Schema.Boolean,
        forbid_end_exercise: Schema.Boolean,
        switch_to_student: Schema.Boolean,
        switch_to_teacher: Schema.Boolean,
        switch_to_assistant: Schema.Boolean,
        teacher_users: Schema.Array(Schema.String),
        group_name: Schema.String,
        teacher_count: Schema.Int,
        student_count: Schema.Int,
        course_group_count: Schema.Int,
        credit: Schema.Number,
        course_id: Schema.Int,
        sub_discipline_id: NullableNumber,
        discipline_id: NullableNumber,
        class_period: Schema.Int,
        course_end: Schema.Boolean,
        start_date: NullableString,
        deadline: NullableString,
        code_halt: Schema.Boolean,
        show_invite_code: Schema.Boolean,
        invite_code: Schema.String,
        invite_code_halt: Schema.Int,
        visits: Schema.Int,
        course_identity: Schema.Int,
        excellent: Schema.Boolean,
        subject_identifier: Schema.String,
        third_party_name: NullableString,
        third_party_tip: Schema.Boolean,
        third_part_login_url: Schema.String,
        need_third_part_logined: Schema.Boolean,
        mooc_user_id: NullableNumber,
        mooc_course_id: NullableNumber,
        featured: Schema.Boolean,
        is_import_student: Schema.Boolean,
      }),
    }),
  )
  .add(
    HttpApiEndpoint.get("leftBanner", "/api/courses/:courseId/left_banner.json", {
      params: CourseRequestParams,
      query: CourseRequestQuery,
      /*
      .sample/course2.har: GET /api/courses/MOAPGNLO/left_banner.json
      {
        "is_teacher": false,
        "course_modules": [
          {
            "id": 1809404,
            "name": "<module name>",
            "init_name": "<init name>",
            "type": "shixun_homework",
            "position": 2,
            "main_id": 109348,
            "category_url": "/classrooms/MOAPGNLO/shixun_homework",
            "second_category": ["<Category>"]
          }
        ],
        "hidden_modules": [
          {
            "id": 1938853,
            "name": "<module name>",
            "type": "teaching_plan",
            "position": 13
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
            init_name: Schema.String,
            type: Schema.String,
            position: Schema.Int,
            main_id: Schema.Int,
            category_url: Schema.String,
            second_category: Schema.optionalKey(Schema.Array(Category)),
          }),
        ),
        hidden_modules: Schema.Array(Schema.Json),
      }),
    }),
  )
  .add(
    HttpApiEndpoint.get("homeworkCommons", "/api/courses/:courseId/homework_commons.json", {
      params: CourseRequestParams,
      query: {
        coursesId: Schema.NullishOr(NonEmptyString),
        id: NonEmptyString,
        limit: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        type: Schema.Int,
        status: Schema.NullishOr(Schema.Int),
        category: Schema.NullishOr(IdFromString),
        page: Schema.NullishOr(Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1)))),
        order: Schema.NullishOr(Schema.Int),
        search: Schema.NullishOr(Schema.String),
        sort_by: Schema.NullishOr(Schema.Literals(["created_at", "updated_at", "name_pinyin", "position"])),
        sort_direction: Schema.NullishOr(Schema.Literals(["asc", "desc"])),
        zzud: NonEmptyString,
      },
      success: HomeworkCommonsResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("exercises", "/api/v2/courses/:courseId/exercises.json", {
      params: CourseRequestParams,
      query: {
        coursesId: NonEmptyString,
        limit: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        type: Schema.String,
        id: NonEmptyString,
        page: Schema.NullishOr(Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1)))),
        zzud: NonEmptyString,
      },
      /*
      .sample/course2.har: GET /api/v2/courses/MOAPGNLO/exercises.json
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
