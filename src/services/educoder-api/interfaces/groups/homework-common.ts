import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const NonEmptyString = Schema.String.pipe(Schema.check(Schema.isMinLength(1)));
const NullableString = Schema.NullishOr(Schema.String);
const NullableNumber = Schema.NullishOr(Schema.Number);
const JsonObject = Schema.Record(Schema.String, Schema.Json);

const HomeworkCommonRequestParams = {
  homeworkId: NonEmptyString,
};

const HomeworkCommonBaseFields = {
  course_id: Schema.optionalKey(Schema.Int),
  course_name: Schema.optionalKey(Schema.String),
  is_end: Schema.optionalKey(Schema.Boolean),
  course_end_date: Schema.optionalKey(NullableString),
  category: Schema.optionalKey(
    Schema.Struct({
      category_id: Schema.Int,
      category_name: Schema.String,
      main: Schema.Int,
    }),
  ),
  homework_status: Schema.optionalKey(Schema.Array(Schema.String)),
  time_status: Schema.optionalKey(Schema.Int),
  all_group_late: Schema.optionalKey(Schema.Json),
  open_evaluate: Schema.optionalKey(Schema.Json),
  homework_name: Schema.optionalKey(Schema.String),
  action_analysis: Schema.optionalKey(Schema.Boolean),
  homework_id: Schema.optionalKey(Schema.Int),
  homework_type: Schema.optionalKey(Schema.String),
  is_old_data_for_time: Schema.optionalKey(Schema.Boolean),
};

/*
.sample/homework4.har: GET /api/homework_commons/3487339/student_works/new.json
{
  "course_id": 109348,
  "course_name": "<course name>",
  "category": { "category_id": 1809406, "category_name": "<category>", "main": 1 },
  "homework_status": ["提交中"],
  "homework_name": "<homework name>",
  "homework_id": 3487339,
  "homework_type": "normal"
}
*/
const HomeworkCommonBaseResponse = Schema.StructWithRest(Schema.Struct(HomeworkCommonBaseFields), [JsonObject]);

/*
.sample/homework4.har: GET /api/homework_commons/3487339.json
{
  "homework_id": 3487339,
  "homework_name": "<homework name>",
  "work_id": 284732541,
  "can_submit": false,
  "description": "<homework description>",
  "attachments": [
    {
      "id": 20544909,
      "title": "<attachment title>",
      "filesize": "17.0 KB",
      "file_type": "office",
      "download_url": "https://<attachment-url>"
    }
  ],
  "submit_limit": false,
  "submit_limit_num": 200,
  "must_file": false
}
*/
const HomeworkCommonDetailResponse = Schema.StructWithRest(
  Schema.Struct({
    ...HomeworkCommonBaseFields,
    publish_immediately: Schema.optionalKey(Schema.Boolean),
    end_immediately: Schema.optionalKey(Schema.Boolean),
    view_answer: Schema.optionalKey(Schema.Boolean),
    work_statuses: Schema.optionalKey(Schema.Array(Schema.String)),
    work_id: Schema.optionalKey(Schema.Int),
    reference_answer: Schema.optionalKey(Schema.String),
    group_collective_score: Schema.optionalKey(Schema.Boolean),
    submit_size: Schema.optionalKey(Schema.Int),
    can_submit: Schema.optionalKey(Schema.Boolean),
    answer_public: Schema.optionalKey(Schema.Boolean),
    is_open_ai_review: Schema.optionalKey(Schema.Boolean),
    description: Schema.optionalKey(Schema.String),
    hide_explanation: Schema.optionalKey(Schema.Boolean),
    is_shixun: Schema.optionalKey(Schema.Boolean),
    attachments: Schema.optionalKey(Schema.Array(Schema.Json)),
    submit_limit: Schema.optionalKey(Schema.Boolean),
    submit_limit_num: Schema.optionalKey(Schema.Int),
    must_file: Schema.optionalKey(Schema.Boolean),
  }),
  [JsonObject],
);

/*
.sample/homework4.har: POST /api/homework_commons/3487339/works_list.json
{
  "coursesId": "109348",
  "categoryId": "3487339"
}
*/
const WorksListPayload = Schema.Struct({
  coursesId: NonEmptyString,
  categoryId: NonEmptyString,
}).pipe(HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }));

/*
.sample/homework4.har: POST /api/homework_commons/3487339/works_list.json
{
  "homework_id": 3487339,
  "homework_name": "<homework name>",
  "work_id": 284732541,
  "can_submit": false,
  "submit_num": 3,
  "commit_count": 6,
  "uncommit_count": 1121,
  "left_time": { "status": "剩余提交时间", "time": "41 天 9 小时" },
  "work_status": 0,
  "work_score": "--",
  "user_login": "<login>",
  "student_id": "<student id>",
  "user_name": "<student name>",
  "group_name": "<group>",
  "student_works": []
}
*/
const WorksListResponse = Schema.StructWithRest(
  Schema.Struct({
    ...HomeworkCommonBaseFields,
    publish_immediately: Schema.optionalKey(Schema.Boolean),
    end_immediately: Schema.optionalKey(Schema.Boolean),
    view_answer: Schema.optionalKey(Schema.Boolean),
    work_statuses: Schema.optionalKey(Schema.Array(Schema.String)),
    work_id: Schema.optionalKey(Schema.Int),
    is_shixun: Schema.optionalKey(Schema.Boolean),
    is_ai: Schema.optionalKey(Schema.Boolean),
    can_make_up: Schema.optionalKey(Schema.Boolean),
    submit_limit: Schema.optionalKey(Schema.Boolean),
    submit_limit_num: Schema.optionalKey(Schema.Int),
    submit_num: Schema.optionalKey(Schema.Int),
    can_submit: Schema.optionalKey(Schema.Boolean),
    must_file: Schema.optionalKey(Schema.Boolean),
    allow_late: Schema.optionalKey(Schema.Boolean),
    publish_time: Schema.optionalKey(Schema.String),
    end_time: Schema.optionalKey(Schema.String),
    late_time: Schema.optionalKey(Schema.String),
    submit_size: Schema.optionalKey(Schema.Int),
    commit_count: Schema.optionalKey(Schema.Int),
    uncommit_count: Schema.optionalKey(Schema.Int),
    left_time: Schema.optionalKey(
      Schema.StructWithRest(
        Schema.Struct({
          status: Schema.optionalKey(Schema.String),
          time: Schema.optionalKey(Schema.String),
        }),
        [JsonObject],
      ),
    ),
    id: Schema.optionalKey(Schema.Int),
    work_status: Schema.optionalKey(Schema.Int),
    update_time: Schema.optionalKey(Schema.Json),
    work_score: Schema.optionalKey(Schema.Json),
    final_score: Schema.optionalKey(Schema.Json),
    teacher_score: Schema.optionalKey(Schema.Json),
    student_score: Schema.optionalKey(Schema.Json),
    teaching_asistant_score: Schema.optionalKey(Schema.Json),
    group_leader_score: Schema.optionalKey(Schema.Json),
    ta_comment_count: Schema.optionalKey(Schema.Int),
    submit_count: Schema.optionalKey(Schema.Int),
    redo_count: Schema.optionalKey(Schema.Int),
    user_login: Schema.optionalKey(Schema.String),
    student_id: Schema.optionalKey(Schema.String),
    user_name: Schema.optionalKey(Schema.String),
    group_name: Schema.optionalKey(Schema.String),
    group_data: Schema.optionalKey(Schema.Json),
    student_works: Schema.optionalKey(Schema.Array(Schema.Json)),
  }),
  [JsonObject],
);

/*
.sample/homework4.har: GET /api/homework_commons/3487339/student_works/search_member_list.json
{
  "members": [
    {
      "user_id": 2905482,
      "user_name": "<student name>",
      "group_name": "<group>",
      "student_id": "<student id>",
      "commit_status": false,
      "is_team": true
    }
  ],
  "is_ai": false
}
*/
const SearchMemberListResponse = Schema.Struct({
  members: Schema.Array(
    Schema.StructWithRest(
      Schema.Struct({
        user_id: Schema.optionalKey(Schema.Int),
        user_name: Schema.optionalKey(Schema.String),
        group_name: Schema.optionalKey(Schema.String),
        student_id: Schema.optionalKey(Schema.String),
        commit_status: Schema.optionalKey(Schema.Boolean),
        is_team: Schema.optionalKey(Schema.Boolean),
      }),
      [JsonObject],
    ),
  ),
  is_ai: Schema.Boolean,
});

/*
.sample/homework4.har: GET /api/homework_commons/3487339/show_comment.json
{
  "homework_user_id": 317512,
  "messages_count": 0,
  "parent_messages_count": 0,
  "comments": []
}
*/
const ShowCommentResponse = Schema.Struct({
  homework_user_id: Schema.Int,
  messages_count: Schema.Int,
  parent_messages_count: Schema.Int,
  comments: Schema.Array(Schema.Json),
});

/*
.sample/homework4.har: GET /api/homework_commons/3487339/settings.json
{
  "homework_id": 3487339,
  "homework_name": "<homework name>",
  "publish_time": "2026-05-10T08:30:00.000+08:00",
  "end_time": "2026-06-21T23:59:00.000+08:00",
  "total_score": 100,
  "score_details": [{ "name": "<score item>", "score": 40 }],
  "group_settings": [{ "group_id": 144948, "group_name": "<group>" }],
  "submit_num": 3,
  "can_submit": false,
  "allow_late": false
}
*/
const SettingsResponse = Schema.StructWithRest(
  Schema.Struct({
    ...HomeworkCommonBaseFields,
    publish_time: Schema.optionalKey(Schema.String),
    end_time: Schema.optionalKey(Schema.String),
    late_time: Schema.optionalKey(NullableString),
    work_public: Schema.optionalKey(Schema.Boolean),
    score_open: Schema.optionalKey(Schema.Boolean),
    answer_public: Schema.optionalKey(Schema.Boolean),
    comment_public: Schema.optionalKey(Schema.Boolean),
    total_score: Schema.optionalKey(Schema.Number),
    score_details: Schema.optionalKey(Schema.Array(Schema.Json)),
    group_settings: Schema.optionalKey(Schema.Array(Schema.Json)),
    allow_late_settings: Schema.optionalKey(Schema.Array(Schema.Json)),
    anonymous_comment: Schema.optionalKey(Schema.Boolean),
    anonymous_appeal: Schema.optionalKey(Schema.Boolean),
    submit_num: Schema.optionalKey(Schema.Int),
    can_submit: Schema.optionalKey(Schema.Boolean),
    can_make_up: Schema.optionalKey(Schema.Boolean),
    allow_late: Schema.optionalKey(Schema.Boolean),
    submit_limit: Schema.optionalKey(Schema.Boolean),
    submit_limit_num: Schema.optionalKey(Schema.Int),
    must_file: Schema.optionalKey(Schema.Boolean),
    submit_size: Schema.optionalKey(Schema.Int),
    can_edit: Schema.optionalKey(Schema.Boolean),
    student_works: Schema.optionalKey(Schema.Json),
    all_user_size: Schema.optionalKey(Schema.Int),
    make_up_score: Schema.optionalKey(NullableNumber),
    late_penalty: Schema.optionalKey(NullableNumber),
  }),
  [JsonObject],
);

/*
.sample/homework4.har: GET /api/homework_commons/3487339/redo_logs.json
{
  "status": 0,
  "message": "响应成功",
  "data": {
    "homework_type": "normal",
    "count": 0,
    "list": []
  }
}
*/
const RedoLogsResponse = Schema.Struct({
  status: Schema.Int,
  message: Schema.String,
  data: Schema.StructWithRest(
    Schema.Struct({
      homework_type: Schema.optionalKey(Schema.String),
      count: Schema.optionalKey(Schema.Int),
      list: Schema.optionalKey(Schema.Array(Schema.Json)),
    }),
    [JsonObject],
  ),
});

export const HomeworkCommon = HttpApiGroup.make("HomeworkCommon")
  .add(
    HttpApiEndpoint.get("info", "/api/homework_commons/:homeworkId.json", {
      params: HomeworkCommonRequestParams,
      query: {
        zzud: NonEmptyString,
      },
      success: HomeworkCommonDetailResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("studentWorkNew", "/api/homework_commons/:homeworkId/student_works/new.json", {
      params: HomeworkCommonRequestParams,
      query: {
        coursesId: NonEmptyString,
        commonHomeworkId: NonEmptyString,
        type: Schema.Int,
        zzud: NonEmptyString,
      },
      success: HomeworkCommonBaseResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("searchMemberList", "/api/homework_commons/:homeworkId/student_works/search_member_list.json", {
      params: HomeworkCommonRequestParams,
      query: {
        coursesId: NonEmptyString,
        commonHomeworkId: NonEmptyString,
        page: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        limit: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        search: Schema.String,
        zzud: NonEmptyString,
      },
      success: SearchMemberListResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("worksList", "/api/homework_commons/:homeworkId/works_list.json", {
      params: HomeworkCommonRequestParams,
      query: {
        zzud: NonEmptyString,
      },
      payload: WorksListPayload,
      success: WorksListResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("showComment", "/api/homework_commons/:homeworkId/show_comment.json", {
      params: HomeworkCommonRequestParams,
      query: {
        coursesId: NonEmptyString,
        categoryId: NonEmptyString,
        page_size: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        zzud: NonEmptyString,
      },
      success: ShowCommentResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("settings", "/api/homework_commons/:homeworkId/settings.json", {
      params: HomeworkCommonRequestParams,
      query: {
        coursesId: NonEmptyString,
        categoryId: NonEmptyString,
        zzud: NonEmptyString,
      },
      success: SettingsResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("redoLogs", "/api/homework_commons/:homeworkId/redo_logs.json", {
      params: HomeworkCommonRequestParams,
      query: {
        type: Schema.Int,
        limit: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        page: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        zzud: NonEmptyString,
      },
      success: RedoLogsResponse,
    }),
  );
