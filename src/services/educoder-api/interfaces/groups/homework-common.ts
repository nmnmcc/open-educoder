import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const StringValue = Schema.String;
const NullableString = Schema.NullishOr(Schema.String);
const NullableNumber = Schema.NullishOr(Schema.Number);
const NullableBoolean = Schema.NullishOr(Schema.Boolean);
const TaskOperation = Schema.Tuple([Schema.String, Schema.String, Schema.optionalKey(Schema.Boolean)]);

const HomeworkCommonRequestParams = {
  homeworkId: StringValue,
};

/*
Sample: GET /api/homework_commons/3487339/student_works/new.json
{ "category_id": 1809406, "category_name": "<category>", "main": 1 }
*/
const HomeworkCategory = Schema.Struct({
  category_id: Schema.Int,
  category_name: Schema.String,
  main: Schema.Int,
});

/*
Sample: GET /api/homework_commons/3487339/student_works/new.json
{
  "course_id": 109348,
  "course_name": "<course name>",
  "is_end": false,
  "course_end_date": null,
  "category": { "category_id": 1809406, "category_name": "<category>", "main": 1 },
  "homework_status": ["提交中"],
  "time_status": 1,
  "open_evaluate": null,
  "homework_name": "<homework name>",
  "homework_id": 3487339,
  "homework_type": "normal"
}
*/
const HomeworkCommonBaseResponse = Schema.Struct({
  course_id: Schema.Int,
  course_name: Schema.String,
  is_end: Schema.Boolean,
  course_end_date: NullableString,
  category: HomeworkCategory,
  homework_status: Schema.Array(Schema.String),
  time_status: Schema.Int,
  open_evaluate: NullableBoolean,
  homework_name: Schema.String,
  homework_id: Schema.Int,
  homework_type: Schema.String,
});

const HomeworkCommonBaseFields = HomeworkCommonBaseResponse.fields;

/*
Sample: GET /api/homework_commons/3487339.json
{
  "id": 20544909,
  "title": "<attachment title>",
  "filesize": "17.0 KB",
  "is_pdf": false,
  "file_type": "office",
  "url": "https://<attachment-url>",
  "file_sub": "docx",
  "is_edit": false,
  "download_url": "https://<attachment-url>"
}
*/
const Attachment = Schema.Struct({
  id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  title: Schema.optionalKey(NullableString),
  filesize: Schema.optionalKey(NullableString),
  is_pdf: Schema.optionalKey(NullableBoolean),
  file_type: Schema.optionalKey(NullableString),
  url: Schema.optionalKey(NullableString),
  file_sub: Schema.optionalKey(NullableString),
  is_edit: Schema.optionalKey(NullableBoolean),
  download_url: Schema.optionalKey(NullableString),
});

/*
Sample: GET /api/homework_commons/3487339.json
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
  "must_file": false,
  "task_operation": ["继续挑战", "/shixuns/e6fhjnqx/shixun_exec.json?homework_common_id=3487324", true],
  "shixun_identifier": "e6fhjnqx",
  "shixun_id": 123456,
  "shixun_status": 2,
  "myshixun_identifier": "iwk6hzbgyf"
}
*/
const HomeworkCommonDetailResponse = Schema.Struct({
  ...HomeworkCommonBaseFields,
  view_answer: Schema.optionalKey(NullableBoolean),
  work_statuses: Schema.optionalKey(Schema.NullishOr(Schema.Array(Schema.String))),
  work_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  submit_size: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  can_submit: Schema.optionalKey(NullableBoolean),
  answer_public: Schema.optionalKey(NullableBoolean),
  description: Schema.optionalKey(NullableString),
  attachments: Schema.optionalKey(Schema.NullishOr(Schema.Array(Attachment))),
  submit_limit: Schema.optionalKey(NullableBoolean),
  submit_limit_num: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  must_file: Schema.optionalKey(NullableBoolean),
  task_operation: Schema.optionalKey(Schema.NullishOr(TaskOperation)),
  shixun_identifier: Schema.optionalKey(NullableString),
  shixun_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  shixun_status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  myshixun_identifier: Schema.optionalKey(NullableString),
});

/*
Sample: GET /api/homework_commons/3487324/shixun_challenge_data.json
{
  "challenge_id": 3475325,
  "task_operation": ["继续挑战", "/shixuns/e6fhjnqx/shixun_exec.json?homework_common_id=3487324", true],
  "challenge_name": "<challenge name>",
  "challenge_score": 20,
  "status": "required",
  "difficulty": "简单",
  "knowledge_points": "",
  "evaluate_count": 1,
  "time_consuming": "1分 30秒",
  "passed_status": 2,
  "game_score": "20.00"
}
*/
const ShixunChallengeSetting = Schema.Struct({
  challenge_id: Schema.Int,
  task_operation: Schema.NullishOr(TaskOperation),
  challenge_name: Schema.String,
  challenge_score: Schema.Number,
  status: Schema.String,
  difficulty: Schema.String,
  knowledge_points: Schema.String,
  evaluate_count: Schema.Int,
  time_consuming: Schema.String,
  passed_status: Schema.Int,
  game_score: Schema.String,
});

/*
Sample: GET /api/homework_commons/3487324/shixun_challenge_data.json
{
  "status": 0,
  "message": "响应成功",
  "data": {
    "challenge_settings": ["<ShixunChallengeSetting>"],
    "work_score": "40.0",
    "evaluate_count": 3,
    "time_consuming": "5分 16秒",
    "passed_count": 2,
    "no_evaluate_count": 3
  }
}
*/
const ShixunChallengeDataResponse = Schema.Struct({
  status: Schema.Int,
  message: Schema.String,
  data: Schema.Struct({
    challenge_settings: Schema.Array(ShixunChallengeSetting),
    work_score: Schema.String,
    evaluate_count: Schema.Int,
    time_consuming: Schema.String,
    passed_count: Schema.Int,
    no_evaluate_count: Schema.Int,
  }),
});

/*
Sample: POST /api/homework_commons/3487339/works_list.json
{
  "coursesId": "109348",
  "categoryId": "3487339"
}
*/
const WorksListPayload = Schema.Struct({
  coursesId: StringValue,
  categoryId: StringValue,
}).pipe(HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }));

/*
Sample: POST /api/homework_commons/3487339/works_list.json
{ "status": "剩余提交时间", "time": "41 天 9 小时" }
*/
const LeftTime = Schema.Struct({
  status: Schema.String,
  time: Schema.String,
});

/*
Sample: POST /api/homework_commons/3487339/works_list.json
{
  "work_count": null,
  "not_submitted_num": null,
  "submitted_num": null,
  "delayed_num": null,
  "no_evaluate": null,
  "evaluate": null,
  "in_evaluate": null,
  "review": null,
  "under_review": null
}
*/
const WorksGroupData = Schema.Struct({
  work_count: Schema.optionalKey(NullableNumber),
  not_submitted_num: Schema.optionalKey(NullableNumber),
  submitted_num: Schema.optionalKey(NullableNumber),
  delayed_num: Schema.optionalKey(NullableNumber),
  no_evaluate: Schema.optionalKey(NullableNumber),
  evaluate: Schema.optionalKey(NullableNumber),
  in_evaluate: Schema.optionalKey(NullableNumber),
  review: Schema.optionalKey(NullableNumber),
  under_review: Schema.optionalKey(NullableNumber),
});

/*
Sample: POST /api/homework_commons/3487339/works_list.json
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
  "group_name": "<group>"
}
*/
const WorksListResponse = Schema.Struct({
  ...HomeworkCommonBaseFields,
  work_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  submit_num: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  can_submit: Schema.optionalKey(NullableBoolean),
  submit_size: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  commit_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  uncommit_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  left_time: Schema.optionalKey(Schema.NullishOr(LeftTime)),
  id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  work_status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  update_time: Schema.optionalKey(NullableString),
  work_score: Schema.optionalKey(Schema.String),
  final_score: Schema.optionalKey(Schema.String),
  teacher_score: Schema.optionalKey(Schema.String),
  student_score: Schema.optionalKey(Schema.String),
  teaching_asistant_score: Schema.optionalKey(Schema.String),
  group_leader_score: Schema.optionalKey(Schema.String),
  ta_comment_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  submit_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  redo_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  user_login: Schema.optionalKey(Schema.String),
  student_id: Schema.optionalKey(Schema.String),
  user_name: Schema.optionalKey(Schema.String),
  group_name: Schema.optionalKey(Schema.String),
  group_data: Schema.optionalKey(Schema.NullishOr(WorksGroupData)),
});

/*
Sample: GET /api/homework_commons/3487339/student_works/search_member_list.json
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
    Schema.Struct({
      user_id: Schema.Int,
      user_name: Schema.String,
      group_name: NullableString,
      student_id: NullableString,
      commit_status: NullableBoolean,
      is_team: NullableBoolean,
    }),
  ),
  is_ai: Schema.Boolean,
});

/*
Sample: GET /api/homework_commons/3487339/show_comment.json
{
  "homework_user_id": 317512,
  "messages_count": 0,
  "parent_messages_count": 0
}
*/
const ShowCommentResponse = Schema.Struct({
  homework_user_id: Schema.Int,
  messages_count: Schema.Int,
  parent_messages_count: Schema.Int,
});

/*
Sample: GET /api/homework_commons/3487339/settings.json
{ "name": "<score item>", "score": 40 }
*/
const ScoreDetail = Schema.Struct({
  name: Schema.String,
  score: Schema.Number,
});

/*
Sample: GET /api/homework_commons/3487339/settings.json
{
  "group_id": 144948,
  "group_name": "<group>"
}
*/
const GroupSetting = Schema.Struct({
  group_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  group_name: Schema.optionalKey(NullableString),
});

/*
Sample: GET /api/homework_commons/3487339/settings.json
{
  "group_id": 144948,
  "group_name": "<group>"
}
*/
const AllowLateSetting = Schema.Struct({
  group_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  group_name: Schema.optionalKey(NullableString),
});

/*
Sample: GET /api/homework_commons/3487339/settings.json
{
  "group_id": 144948,
  "group_name": "<group>"
}
*/
const AnonymousCommentSetting = Schema.Struct({
  group_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  group_name: Schema.optionalKey(NullableString),
});

/*
Sample: GET /api/homework_commons/3487339/settings.json
{
  "group_id": 144948,
  "group_name": "<group>"
}
*/
const AnonymousAppealSetting = Schema.Struct({
  group_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  group_name: Schema.optionalKey(NullableString),
});

/*
Sample: GET /api/homework_commons/3487339/settings.json
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
const SettingsResponse = Schema.Struct({
  ...HomeworkCommonBaseFields,
  publish_time: Schema.optionalKey(NullableString),
  end_time: Schema.optionalKey(NullableString),
  late_time: Schema.optionalKey(NullableString),
  work_public: Schema.optionalKey(NullableBoolean),
  score_open: Schema.optionalKey(NullableBoolean),
  answer_public: Schema.optionalKey(NullableBoolean),
  comment_public: Schema.optionalKey(NullableBoolean),
  total_score: Schema.optionalKey(NullableNumber),
  late_penalty: Schema.optionalKey(NullableNumber),
  allow_late: Schema.optionalKey(NullableBoolean),
  score_details: Schema.optionalKey(Schema.NullishOr(Schema.Array(ScoreDetail))),
  submit_num: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  can_submit: Schema.optionalKey(NullableBoolean),
  can_make_up: Schema.optionalKey(NullableBoolean),
  group_settings: Schema.optionalKey(Schema.NullishOr(Schema.Array(GroupSetting))),
  allow_late_settings: Schema.optionalKey(Schema.NullishOr(Schema.Array(AllowLateSetting))),
  anonymous_comment: Schema.optionalKey(NullableBoolean),
  anonymous_appeal: Schema.optionalKey(NullableBoolean),
  submit_limit: Schema.optionalKey(NullableBoolean),
  submit_limit_num: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  must_file: Schema.optionalKey(NullableBoolean),
  anonymous_comment_settings: Schema.optionalKey(Schema.NullishOr(Schema.Array(AnonymousCommentSetting))),
  all_user_size: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  student_works: Schema.optionalKey(NullableBoolean),
  anonymous_appeal_settings: Schema.optionalKey(Schema.NullishOr(Schema.Array(AnonymousAppealSetting))),
  can_edit: Schema.optionalKey(NullableBoolean),
  submit_size: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
});

/*
Sample: GET /api/homework_commons/3487339/redo_logs.json
{
  "status": 0,
  "message": "响应成功",
  "data": {
    "homework_type": "normal",
    "count": 0
  }
}
*/
const RedoLogsResponse = Schema.Struct({
  status: Schema.Int,
  message: Schema.String,
  data: Schema.Struct({
    homework_type: Schema.String,
    count: Schema.Int,
  }),
});

export const HomeworkCommon = HttpApiGroup.make("HomeworkCommon")
  .add(
    HttpApiEndpoint.get("info", "/api/homework_commons/:homeworkId.json", {
      params: HomeworkCommonRequestParams,
      query: {
        zzud: StringValue,
      },
      success: HomeworkCommonDetailResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("studentWorkNew", "/api/homework_commons/:homeworkId/student_works/new.json", {
      params: HomeworkCommonRequestParams,
      query: {
        coursesId: StringValue,
        commonHomeworkId: StringValue,
        type: Schema.Int,
        zzud: StringValue,
      },
      success: HomeworkCommonBaseResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("searchMemberList", "/api/homework_commons/:homeworkId/student_works/search_member_list.json", {
      params: HomeworkCommonRequestParams,
      query: {
        coursesId: StringValue,
        commonHomeworkId: StringValue,
        page: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        limit: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        search: Schema.String,
        zzud: StringValue,
      },
      success: SearchMemberListResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("worksList", "/api/homework_commons/:homeworkId/works_list.json", {
      params: HomeworkCommonRequestParams,
      query: {
        zzud: StringValue,
      },
      payload: WorksListPayload,
      success: WorksListResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("showComment", "/api/homework_commons/:homeworkId/show_comment.json", {
      params: HomeworkCommonRequestParams,
      query: {
        coursesId: StringValue,
        categoryId: StringValue,
        page_size: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
        zzud: StringValue,
      },
      success: ShowCommentResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("settings", "/api/homework_commons/:homeworkId/settings.json", {
      params: HomeworkCommonRequestParams,
      query: {
        coursesId: StringValue,
        categoryId: StringValue,
        zzud: StringValue,
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
        zzud: StringValue,
      },
      success: RedoLogsResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("shixunChallengeData", "/api/homework_commons/:homeworkId/shixun_challenge_data.json", {
      params: HomeworkCommonRequestParams,
      query: {
        zzud: StringValue,
      },
      success: ShixunChallengeDataResponse,
    }),
  );
