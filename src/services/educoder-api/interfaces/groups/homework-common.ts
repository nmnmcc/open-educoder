import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const NonEmptyString = Schema.String.pipe(Schema.check(Schema.isMinLength(1)));
const EmptyArray = Schema.Array(Schema.Never);
const NullableString = Schema.NullOr(Schema.String);
const NullableNumber = Schema.NullOr(Schema.Number);
const NullableBoolean = Schema.NullOr(Schema.Boolean);
const TaskOperationItem = Schema.Union([Schema.String, Schema.Boolean]);

const HomeworkCommonRequestParams = {
  homeworkId: NonEmptyString,
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
  all_group_late: NullableBoolean,
  open_evaluate: NullableBoolean,
  homework_name: Schema.String,
  action_analysis: Schema.Boolean,
  homework_id: Schema.Int,
  homework_type: Schema.String,
  is_old_data_for_time: Schema.Boolean,
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
  id: Schema.Int,
  title: Schema.String,
  filesize: Schema.String,
  description: NullableString,
  is_pdf: Schema.Boolean,
  file_type: Schema.String,
  url: Schema.String,
  file_sub: Schema.String,
  is_edit: Schema.Boolean,
  download_url: Schema.String,
});

/*
Sample: GET /api/homework_commons/3487324.json
{
  "shixun_status": 2,
  "task_operation": ["继续挑战", "/shixuns/e6fhjnqx/shixun_exec.json?homework_common_id=3487324", true],
  "can_fork": null,
  "can_copy": false,
  "id": 1339717,
  "identifier": "e6fhjnqx",
  "name": "<shixun name>",
  "score_info": 5
}
*/
const ShixunInfo = Schema.Struct({
  shixun_status: Schema.Int,
  task_operation: Schema.Array(TaskOperationItem),
  can_fork: NullableBoolean,
  can_copy: Schema.Boolean,
  id: Schema.Int,
  identifier: Schema.String,
  name: Schema.String,
  stu_num: Schema.Int,
  spoc_stu_num: Schema.Int,
  total_stu_num: Schema.Int,
  experience: Schema.Int,
  diffcult: Schema.String,
  score_info: Schema.Number,
  is_jupyter: Schema.Boolean,
  is_jupyter_lab: Schema.Boolean,
  visits: Schema.Int,
  spoc_visits: Schema.Int,
  total_visits: Schema.Int,
  gold: Schema.Int,
  collection_count: Schema.Int,
  propaedeutics: Schema.Boolean,
  banner_image: NullableString,
  banner_image_b: NullableString,
  public: Schema.Int,
  created_at: Schema.String,
  updated_at: Schema.String,
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
  "must_file": false
}
*/
const NormalHomeworkCommonDetailResponse = Schema.Struct({
  ...HomeworkCommonBaseFields,
  publish_immediately: Schema.Boolean,
  end_immediately: Schema.Boolean,
  view_answer: Schema.Boolean,
  work_statuses: Schema.Array(Schema.String),
  work_id: Schema.Int,
  reference_answer: Schema.String,
  group_collective_score: Schema.Boolean,
  submit_size: Schema.Int,
  can_submit: Schema.Boolean,
  answer_public: Schema.Boolean,
  is_open_ai_review: Schema.Boolean,
  description: Schema.String,
  hide_explanation: Schema.Boolean,
  is_shixun: Schema.Boolean,
  attachments: Schema.Array(Attachment),
  submit_limit: Schema.Boolean,
  submit_limit_num: Schema.Int,
  must_file: Schema.Boolean,
});

/*
Sample: GET /api/homework_commons/3487324.json
{
  "homework_type": "practice",
  "shixun_identifier": "e6fhjnqx",
  "shixun_id": 1339717,
  "task_operation": ["继续挑战", "/shixuns/e6fhjnqx/shixun_exec.json?homework_common_id=3487324", true],
  "myshixun_identifier": "iwk6hzbgyf",
  "work_id": 295687021,
  "shixun_info": "<ShixunInfo>",
  "attachments": []
}
*/
const ShixunHomeworkCommonDetailResponse = Schema.Struct({
  ...HomeworkCommonBaseFields,
  shixun_identifier: Schema.String,
  shixun_id: Schema.Int,
  shixun_status: Schema.Int,
  publish_immediately: Schema.Boolean,
  end_immediately: Schema.Boolean,
  code_review: Schema.Boolean,
  open_code_quality_analysis: Schema.Boolean,
  is_show_challenge_answer_btn: Schema.Boolean,
  is_show_resubmit_file_btn: Schema.Boolean,
  is_show_resubmit_btn: Schema.Boolean,
  task_operation: Schema.Array(TaskOperationItem),
  view_report: Schema.Boolean,
  commit_des: Schema.Array(Schema.String),
  redo_work: Schema.Boolean,
  myshixun_identifier: Schema.String,
  show_analysis_detail: Schema.Boolean,
  submit_test_result_status: EmptyArray,
  work_id: Schema.Int,
  reference_answer: NullableString,
  group_collective_score: Schema.Boolean,
  submit_size: Schema.Int,
  can_submit: Schema.Boolean,
  answer_public: Schema.Boolean,
  is_open_ai_review: Schema.Boolean,
  description: Schema.String,
  hide_explanation: Schema.Boolean,
  is_shixun: Schema.Boolean,
  shixun_info: ShixunInfo,
  explanation: NullableString,
  attachments: EmptyArray,
  submit_limit: Schema.Boolean,
  submit_limit_num: Schema.Int,
  must_file: Schema.Boolean,
});

/*
Sample: GET /api/homework_commons/3487324.json
{ "homework_type": "normal" } or { "homework_type": "practice", "shixun_info": "<ShixunInfo>" }
*/
const HomeworkCommonDetailResponse = Schema.Union([
  NormalHomeworkCommonDetailResponse,
  ShixunHomeworkCommonDetailResponse,
]);

/*
Sample: POST /api/homework_commons/3487339/works_list.json
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
  publish_immediately: Schema.Boolean,
  end_immediately: Schema.Boolean,
  view_answer: Schema.Boolean,
  work_statuses: Schema.Array(Schema.String),
  work_id: Schema.Int,
  student_works_ids: NullableNumber,
  is_archive: Schema.Boolean,
  enable_hidden: Schema.Boolean,
  hidden_from_teacher: Schema.Boolean,
  hidden_from_student: Schema.Boolean,
  ai_review_method: Schema.Int,
  ai_review_text: NullableString,
  ai_warning: Schema.Boolean,
  ai_self_warning: Schema.Boolean,
  ai_self_warning_score: Schema.Number,
  ai_warning_student: Schema.Boolean,
  ai_warning_student_score: Schema.Number,
  ai_warning_assistant: Schema.Boolean,
  ai_warning_assistant_score: Schema.Number,
  is_new_rule: Schema.Boolean,
  is_shixun: Schema.Boolean,
  is_ai: Schema.Boolean,
  board_id: Schema.Int,
  feedback_notice: Schema.Boolean,
  appeal_notice: Schema.Boolean,
  work_count: NullableNumber,
  all_member_count: Schema.Int,
  course_group_count: Schema.Int,
  is_excellent: Schema.Boolean,
  is_show_request: Schema.Boolean,
  ta_mode: Schema.Int,
  can_make_up: Schema.Boolean,
  submit_limit: Schema.Boolean,
  submit_limit_num: Schema.Int,
  submit_num: Schema.Int,
  can_submit: Schema.Boolean,
  must_file: Schema.Boolean,
  single_score: Schema.Boolean,
  is_evaluation: Schema.Boolean,
  show_ai_review: Schema.Boolean,
  can_use_ai_review: Schema.Boolean,
  zero_commit_student_works: Schema.Boolean,
  homework_create_user_id: Schema.Int,
  homework_create_user_name: Schema.String,
  work_public: Schema.Boolean,
  score_open: Schema.Boolean,
  can_view_details: Schema.Boolean,
  is_repeat_minus: Schema.Boolean,
  can_feedback: Schema.Boolean,
  ai_review_user_id: Schema.Int,
  unanswered_handling: Schema.Int,
  unanswered_comment: NullableString,
  is_open_ai_review: Schema.Boolean,
  allow_late: Schema.Boolean,
  can_publish: Schema.Boolean,
  unified_setting: Schema.Boolean,
  publish_time: Schema.String,
  end_time: Schema.String,
  late_time: Schema.String,
  can_public_work: Schema.Boolean,
  appeal_all_count: Schema.Int,
  appeal_deal_count: Schema.Int,
  appeal_penalty: Schema.Number,
  submit_size: Schema.Int,
  commit_count: Schema.Int,
  uncommit_count: Schema.Int,
  left_time: LeftTime,
  evaluation_start: NullableString,
  evaluation_end: NullableString,
  id: Schema.Int,
  work_status: Schema.Int,
  update_time: NullableString,
  ultimate_score: Schema.Boolean,
  have_repeat: Schema.Boolean,
  repeat_minus_score: Schema.Number,
  group_id: Schema.Int,
  start_identifier: NullableString,
  work_score: Schema.String,
  final_score: Schema.String,
  teacher_score: Schema.String,
  student_score: Schema.String,
  teaching_asistant_score: Schema.String,
  group_leader_score: Schema.String,
  ta_comment_count: Schema.Int,
  submit_count: Schema.Int,
  redo_count: Schema.Int,
  user_login: Schema.String,
  student_id: Schema.String,
  user_name: Schema.String,
  user_img: Schema.String,
  group_name: Schema.String,
  group_data: WorksGroupData,
  student_anonymous_comment: Schema.Boolean,
  anonymous_comment: Schema.Boolean,
  anonymous_appeal: Schema.Boolean,
  student_works: EmptyArray,
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
  is_admin: Schema.Boolean,
  group_id: Schema.Int,
  group_name: Schema.String,
  publish_time: Schema.String,
  end_time: Schema.String,
  rank_forbidden_start: NullableString,
  rank_forbidden_end: NullableString,
  late_minus_score: Schema.Number,
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
  is_admin: Schema.Boolean,
  group_id: Schema.Int,
  group_name: Schema.String,
  penalty_type: Schema.Int,
  evaluation_start: NullableString,
  late_penalty: Schema.String,
  late_time: NullableString,
  rank_forbidden_start: NullableString,
  rank_forbidden_end: NullableString,
  late_minus_score: Schema.Number,
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
  is_admin: Schema.Boolean,
  group_id: Schema.Int,
  group_name: Schema.String,
  evaluation_start: NullableString,
  evaluation_end: NullableString,
  evaluation_num: Schema.Int,
  absence_penalty: Schema.Number,
  student_comment: Schema.Boolean,
  all_user_size: Schema.Int,
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
  is_admin: Schema.Boolean,
  group_id: Schema.Int,
  group_name: Schema.String,
  appeal_time: NullableString,
  appeal_penalty: Schema.Number,
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
  publish_immediately: Schema.Boolean,
  end_immediately: Schema.Boolean,
  view_answer: Schema.Boolean,
  default_evaluation_dimension: Schema.Array(Schema.String),
  work_statuses: Schema.Array(Schema.String),
  work_id: Schema.Int,
  show_ai_review: Schema.Boolean,
  is_sub_pass: Schema.Boolean,
  require_attachment: Schema.Boolean,
  can_use_ai_review: Schema.Boolean,
  zero_commit_student_works: Schema.Boolean,
  publish_time: Schema.String,
  end_time: Schema.String,
  penalty_type: Schema.Int,
  late_time: NullableString,
  work_public: Schema.Boolean,
  score_open: Schema.Boolean,
  personal_score_open: Schema.Boolean,
  answer_public: Schema.Boolean,
  comment_public: Schema.Boolean,
  total_score: Schema.Number,
  hack_rank_rule: Schema.Int,
  show_late_code: Schema.Boolean,
  forbid_copy_answers: Schema.Boolean,
  public_after_abort: Schema.Boolean,
  public_after_over: Schema.Boolean,
  can_feedback: Schema.Boolean,
  ai_review_user_id: Schema.Int,
  ai_review_settings: EmptyArray,
  is_repeat_minus: Schema.Boolean,
  repeat_setting_score: Schema.Number,
  repeat_limit: Schema.Int,
  can_view_details: Schema.Boolean,
  is_open_ai_review: Schema.Boolean,
  related_poll: Schema.Boolean,
  hack_analysis: Schema.Boolean,
  hack_analysis_type: Schema.Int,
  hack_answer: Schema.Boolean,
  hack_answer_type: Schema.Int,
  work_end_forbid_evaluate: Schema.Boolean,
  can_deadline_submit: Schema.Boolean,
  start_permanent: Schema.Boolean,
  answer_public_type: Schema.Int,
  see_comment: Schema.Boolean,
  see_comment_type: Schema.Int,
  shared_review: Schema.Boolean,
  choice_public_result: Schema.Boolean,
  code_editor_paste_allowed: Schema.Boolean,
  answer_unlock_rule: Schema.Int,
  answer_unlock_rule_num: Schema.Int,
  answer_unlock_rule_time: Schema.Int,
  skip_level: Schema.Boolean,
  shixun_skip_level: Schema.Boolean,
  group_collective_score: Schema.Boolean,
  ai_exam_question: Schema.Boolean,
  ai_syntax_check: Schema.Boolean,
  ai_code_diagnosis: Schema.Boolean,
  ai_guidance: Schema.Boolean,
  ai_q_and_a: Schema.Boolean,
  ai_guide: Schema.Boolean,
  ai_code_evaluation_promote: Schema.Array(Schema.String),
  ai_code_evaluation: Schema.Boolean,
  ai_code_optimization: Schema.Boolean,
  ai_code_comment: Schema.Boolean,
  ai_review_method: Schema.Int,
  ai_review_text: NullableString,
  is_score_open: Schema.Boolean,
  late_penalty: Schema.Number,
  have_repeated: Schema.Boolean,
  manage_all_group: Schema.Boolean,
  unified_setting: Schema.Boolean,
  unified_late: Schema.Boolean,
  allow_late: Schema.Boolean,
  single_score: Schema.Boolean,
  score_details: Schema.Array(ScoreDetail),
  training_time_rules: Schema.Int,
  submit_num: Schema.Int,
  make_up_score: Schema.Number,
  can_submit: Schema.Boolean,
  can_make_up: Schema.Boolean,
  abnormal_score: Schema.Number,
  is_open_abnormal_score: Schema.Boolean,
  group_settings: Schema.Array(GroupSetting),
  allow_late_settings: Schema.Array(AllowLateSetting),
  anonymous_comment: Schema.Boolean,
  anonymous_appeal: Schema.Boolean,
  evaluation_start: NullableString,
  evaluation_end: NullableString,
  evaluation_num: Schema.Int,
  absence_penalty: Schema.Number,
  submit_limit: Schema.Boolean,
  submit_limit_num: Schema.Int,
  must_file: Schema.Boolean,
  appeal_time: NullableString,
  appeal_penalty: Schema.Number,
  ta_mode: Schema.Int,
  final_mode: Schema.Boolean,
  te_proportion: Schema.Number,
  ta_proportion: Schema.Number,
  student_comment: Schema.Boolean,
  anonymous_group: Schema.Boolean,
  is_group_grade: Schema.Boolean,
  gr_proportion: Schema.Number,
  teacher_mode: Schema.Int,
  unified_anonymous_comment: Schema.Boolean,
  unified_anonymous_appeal: Schema.Boolean,
  anonymous_comment_settings: Schema.Array(AnonymousCommentSetting),
  all_user_size: Schema.Int,
  student_works: Schema.Boolean,
  can_anonymous_group: Schema.Boolean,
  is_new_rule: Schema.Boolean,
  anonymous_appeal_settings: Schema.Array(AnonymousAppealSetting),
  st_proportion: Schema.Number,
  can_edit: Schema.Boolean,
  submit_size: Schema.Int,
  enable_hidden: Schema.Boolean,
  hidden_from_teacher: Schema.Boolean,
  hidden_from_student: Schema.Boolean,
  is_show_report_setting: Schema.Boolean,
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
