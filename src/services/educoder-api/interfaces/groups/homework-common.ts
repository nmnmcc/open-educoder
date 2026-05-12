import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const StringValue = Schema.String;
const EmptyArray = Schema.Array(Schema.Never);
const NullableString = Schema.NullOr(Schema.String);
const NullableNumber = Schema.NullOr(Schema.Number);
const NullableBoolean = Schema.NullOr(Schema.Boolean);
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
  "category": { "category_id": 1809406, "category_name": "<category>", "main": 1 },
  "homework_status": ["提交中"],
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
  "description": null,
  "is_pdf": false,
  "file_type": "office",
  "url": "https://<attachment-url>",
  "file_sub": "docx",
  "is_edit": false,
  "download_url": "https://<attachment-url>"
}
*/
const Attachment = Schema.Struct({
  id: Schema.optionalKey(Schema.Int),
  title: Schema.optionalKey(Schema.String),
  filesize: Schema.optionalKey(Schema.String),
  is_pdf: Schema.optionalKey(Schema.Boolean),
  file_type: Schema.optionalKey(Schema.String),
  url: Schema.optionalKey(Schema.String),
  file_sub: Schema.optionalKey(Schema.String),
  is_edit: Schema.optionalKey(Schema.Boolean),
  download_url: Schema.optionalKey(Schema.String),
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
  view_answer: Schema.optionalKey(Schema.Boolean),
  work_statuses: Schema.optionalKey(Schema.Array(Schema.String)),
  work_id: Schema.optionalKey(Schema.Int),
  submit_size: Schema.optionalKey(Schema.Int),
  can_submit: Schema.optionalKey(Schema.Boolean),
  answer_public: Schema.optionalKey(Schema.Boolean),
  description: Schema.optionalKey(Schema.String),
  attachments: Schema.optionalKey(Schema.Array(Attachment)),
  submit_limit: Schema.optionalKey(Schema.Boolean),
  submit_limit_num: Schema.optionalKey(Schema.Int),
  must_file: Schema.optionalKey(Schema.Boolean),
  task_operation: Schema.optionalKey(TaskOperation),
  shixun_identifier: Schema.optionalKey(Schema.String),
  shixun_id: Schema.optionalKey(Schema.Int),
  shixun_status: Schema.optionalKey(Schema.Int),
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
  "passed_status": 2,
  "game_score": "20.00"
}
*/
const ShixunChallengeSetting = Schema.Struct({
  challenge_id: Schema.Int,
  task_operation: TaskOperation,
  challenge_name: Schema.String,
  is_choose_todo: Schema.Boolean,
  challenge_score: Schema.Number,
  status: Schema.String,
  difficulty: Schema.String,
  challenge_st: Schema.Int,
  passed_rate: Schema.Number,
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
    "no_evaluate_count": 3,
    "progress_count": 0,
    "is_submit_test_result": false
  }
}
*/
const ShixunChallengeDataResponse = Schema.Struct({
  status: Schema.Int,
  message: Schema.String,
  data: Schema.Struct({
    challenge_settings: Schema.Array(ShixunChallengeSetting),
    user_id: Schema.optionalKey(Schema.Int),
    username: Schema.optionalKey(Schema.String),
    student_id: Schema.optionalKey(Schema.String),
    image_url: Schema.optionalKey(Schema.String),
    group_name: Schema.optionalKey(Schema.String),
    work_score: Schema.String,
    evaluate_count: Schema.Int,
    time_consuming: Schema.String,
    passed_count: Schema.Int,
    no_evaluate_count: Schema.Int,
    progress_count: Schema.Int,
    is_submit_test_result: Schema.Boolean,
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
  work_count: NullableNumber,
  not_submitted_num: NullableNumber,
  submitted_num: NullableNumber,
  delayed_num: NullableNumber,
  no_evaluate: NullableNumber,
  evaluate: NullableNumber,
  in_evaluate: NullableNumber,
  review: NullableNumber,
  under_review: NullableNumber,
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
  "group_name": "<group>",
  "student_works": []
}
*/
const WorksListResponse = Schema.Struct({
  ...HomeworkCommonBaseFields,
  work_id: Schema.optionalKey(Schema.Int),
  submit_num: Schema.optionalKey(Schema.Int),
  can_submit: Schema.optionalKey(Schema.Boolean),
  submit_size: Schema.optionalKey(Schema.Int),
  commit_count: Schema.optionalKey(Schema.Int),
  uncommit_count: Schema.optionalKey(Schema.Int),
  left_time: Schema.optionalKey(LeftTime),
  id: Schema.optionalKey(Schema.Int),
  work_status: Schema.optionalKey(Schema.Int),
  update_time: Schema.optionalKey(NullableString),
  work_score: Schema.optionalKey(Schema.String),
  final_score: Schema.optionalKey(Schema.String),
  teacher_score: Schema.optionalKey(Schema.String),
  student_score: Schema.optionalKey(Schema.String),
  teaching_asistant_score: Schema.optionalKey(Schema.String),
  group_leader_score: Schema.optionalKey(Schema.String),
  ta_comment_count: Schema.optionalKey(Schema.Int),
  submit_count: Schema.optionalKey(Schema.Int),
  redo_count: Schema.optionalKey(Schema.Int),
  user_login: Schema.optionalKey(Schema.String),
  student_id: Schema.optionalKey(Schema.String),
  user_name: Schema.optionalKey(Schema.String),
  group_name: Schema.optionalKey(Schema.String),
  group_data: Schema.optionalKey(WorksGroupData),
  student_works: Schema.optionalKey(EmptyArray),
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
      group_name: Schema.String,
      student_id: Schema.String,
      commit_status: Schema.Boolean,
      is_team: Schema.Boolean,
    }),
  ),
  is_ai: Schema.Boolean,
});

/*
Sample: GET /api/homework_commons/3487339/show_comment.json
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
  comments: EmptyArray,
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
  "is_admin": false,
  "group_id": 144948,
  "group_name": "<group>",
  "publish_time": "2026-05-10T08:30:00.000+08:00",
  "end_time": "2026-06-21T23:59:00.000+08:00",
  "rank_forbidden_start": null,
  "rank_forbidden_end": null,
  "late_minus_score": 0
}
*/
const GroupSetting = Schema.Struct({
  group_id: Schema.optionalKey(Schema.Int),
  group_name: Schema.optionalKey(Schema.String),
});

/*
Sample: GET /api/homework_commons/3487339/settings.json
{
  "is_admin": false,
  "group_id": 144948,
  "group_name": "<group>",
  "penalty_type": 1,
  "evaluation_start": null,
  "late_penalty": "5.0",
  "late_time": null
}
*/
const AllowLateSetting = Schema.Struct({
  group_id: Schema.optionalKey(Schema.Int),
  group_name: Schema.optionalKey(Schema.String),
});

/*
Sample: GET /api/homework_commons/3487339/settings.json
{
  "is_admin": false,
  "group_id": 144948,
  "group_name": "<group>",
  "evaluation_start": null,
  "evaluation_end": null,
  "evaluation_num": 3,
  "absence_penalty": 0,
  "student_comment": false,
  "all_user_size": 63
}
*/
const AnonymousCommentSetting = Schema.Struct({
  group_id: Schema.optionalKey(Schema.Int),
  group_name: Schema.optionalKey(Schema.String),
});

/*
Sample: GET /api/homework_commons/3487339/settings.json
{
  "is_admin": false,
  "group_id": 144948,
  "group_name": "<group>",
  "appeal_time": null,
  "appeal_penalty": 0
}
*/
const AnonymousAppealSetting = Schema.Struct({
  group_id: Schema.optionalKey(Schema.Int),
  group_name: Schema.optionalKey(Schema.String),
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
  publish_time: Schema.optionalKey(Schema.String),
  end_time: Schema.optionalKey(Schema.String),
  late_time: Schema.optionalKey(NullableString),
  work_public: Schema.optionalKey(Schema.Boolean),
  score_open: Schema.optionalKey(Schema.Boolean),
  answer_public: Schema.optionalKey(Schema.Boolean),
  comment_public: Schema.optionalKey(Schema.Boolean),
  total_score: Schema.optionalKey(Schema.Number),
  late_penalty: Schema.optionalKey(Schema.Number),
  allow_late: Schema.optionalKey(Schema.Boolean),
  score_details: Schema.optionalKey(Schema.Array(ScoreDetail)),
  submit_num: Schema.optionalKey(Schema.Int),
  can_submit: Schema.optionalKey(Schema.Boolean),
  can_make_up: Schema.optionalKey(Schema.Boolean),
  group_settings: Schema.optionalKey(Schema.Array(GroupSetting)),
  allow_late_settings: Schema.optionalKey(Schema.Array(AllowLateSetting)),
  anonymous_comment: Schema.optionalKey(Schema.Boolean),
  anonymous_appeal: Schema.optionalKey(Schema.Boolean),
  submit_limit: Schema.optionalKey(Schema.Boolean),
  submit_limit_num: Schema.optionalKey(Schema.Int),
  must_file: Schema.optionalKey(Schema.Boolean),
  anonymous_comment_settings: Schema.optionalKey(Schema.Array(AnonymousCommentSetting)),
  all_user_size: Schema.optionalKey(Schema.Int),
  student_works: Schema.optionalKey(Schema.Boolean),
  anonymous_appeal_settings: Schema.optionalKey(Schema.Array(AnonymousAppealSetting)),
  can_edit: Schema.optionalKey(Schema.Boolean),
  submit_size: Schema.optionalKey(Schema.Int),
});

/*
Sample: GET /api/homework_commons/3487339/redo_logs.json
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
  data: Schema.Struct({
    homework_type: Schema.String,
    count: Schema.Int,
    list: EmptyArray,
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
