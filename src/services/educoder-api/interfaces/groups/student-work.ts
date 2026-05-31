import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

const StringValue = Schema.String;

const StudentWorkRequestParams = {
  workId: StringValue,
};

/*
Sample: GET /api/student_works/284733932.json
{ "category_id": 1809406, "category_name": "<category>", "main": 1 }
*/
const StudentWorkCategory = Schema.Struct({
  category_id: Schema.Int,
  category_name: Schema.String,
  main: Schema.Int,
});

/*
Sample: GET /api/student_works/284733932.json
{
  "id": 22243814,
  "title": "<attachment title>",
  "filesize": "254.0 KB",
  "description": "",
  "is_pdf": false,
  "file_type": "office",
  "url": "https://<attachment-url>",
  "file_sub": "doc",
  "is_edit": false,
  "delete": false,
  "download_url": "https://<attachment-url>"
}
*/
const StudentWorkAttachment = Schema.Struct({
  id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  title: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  filesize: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  description: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  is_pdf: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  file_type: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  url: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  file_sub: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  is_edit: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  delete: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  download_url: Schema.optionalKey(Schema.NullishOr(Schema.String)),
});

/*
Sample: GET /api/student_works/284733932.json
{
  "course_id": 109348,
  "course_name": "<course name>",
  "is_end": false,
  "category": { "category_id": 1809406, "category_name": "<category>", "main": 1 },
  "homework_status": ["提交中"],
  "time_status": 1,
  "homework_name": "<homework name>",
  "homework_id": 3487337,
  "homework_type": "normal",
  "description": "<submission description>",
  "commit_time": "2026-05-31T20:10:14.000+08:00",
  "work_status": 1,
  "attachments": ["<StudentWorkAttachment>"]
}
*/
const StudentWorkDetailResponse = Schema.Struct({
  course_id: Schema.Int,
  course_name: Schema.String,
  is_end: Schema.Boolean,
  course_end_date: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  category: StudentWorkCategory,
  homework_status: Schema.Array(Schema.String),
  time_status: Schema.Int,
  open_evaluate: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  homework_name: Schema.String,
  homework_id: Schema.Int,
  homework_type: Schema.String,
  work_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  description: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  commit_time: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  update_time: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  work_status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  redo_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  can_feedback: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  work_score: Schema.optionalKey(Schema.NullishOr(Schema.Union([Schema.String, Schema.Number]))),
  final_score: Schema.optionalKey(Schema.NullishOr(Schema.Union([Schema.String, Schema.Number]))),
  teacher_score: Schema.optionalKey(Schema.NullishOr(Schema.Union([Schema.String, Schema.Number]))),
  student_score: Schema.optionalKey(Schema.NullishOr(Schema.Union([Schema.String, Schema.Number]))),
  teaching_asistant_score: Schema.optionalKey(Schema.NullishOr(Schema.Union([Schema.String, Schema.Number]))),
  group_leader_score: Schema.optionalKey(Schema.NullishOr(Schema.Union([Schema.String, Schema.Number]))),
  late_penalty: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  absence_penalty: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  appeal_penalty: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  repeat_minus_score: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  anonymous_comment: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  submit_size: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  commit_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  can_submit: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  author_name: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  student_id: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  group_name: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  image_url: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  is_author: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  commit_user_name: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  update_user_name: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  all_commented_finished: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  next_work_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  prev_work_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  attachments: Schema.optionalKey(Schema.NullishOr(Schema.Array(StudentWorkAttachment))),
  lab_status: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  show_evaluation: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
});

/*
Sample: GET /api/student_works/284733932/supply_attachments.json
{
  "revise_reason": null,
  "atta_update_time": null,
  "atta_update_user": null,
  "atta_update_user_login": null,
  "revise_attachments": []
}
*/
const SupplyAttachmentsResponse = Schema.Struct({
  revise_reason: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  atta_update_time: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  atta_update_user: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  atta_update_user_login: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  revise_attachments: Schema.Array(StudentWorkAttachment),
});

/*
Sample: GET /api/student_works/284733932/comment_list.json
{ "last_content": null, "last_score": null }
*/
const LastComment = Schema.Struct({
  last_content: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  last_score: Schema.optionalKey(Schema.NullishOr(Schema.Union([Schema.String, Schema.Number]))),
});

/*
Sample: GET /api/student_works/284733932/comment_list.json
{
  "allow_score": false,
  "ultimate": false,
  "single_score": true,
  "last_comment": { "last_content": null, "last_score": null },
  "last_hidden_comment": { "last_content": null, "last_score": null },
  "is_author": true,
  "comment_count": 0,
  "teacher_list": [],
  "teaching_assistant_list": [],
  "student_list": [],
  "comment_scores": []
}
*/
const CommentListResponse = Schema.Struct({
  allow_score: Schema.Boolean,
  ultimate: Schema.Boolean,
  single_score: Schema.Boolean,
  last_comment: LastComment,
  last_hidden_comment: LastComment,
  is_author: Schema.Boolean,
  comment_count: Schema.Int,
  teacher_list: Schema.Array(Schema.Never),
  teaching_assistant_list: Schema.Array(Schema.Never),
  student_list: Schema.Array(Schema.Never),
  comment_scores: Schema.Array(Schema.Never),
});

export const StudentWork = HttpApiGroup.make("StudentWork")
  .add(
    HttpApiEndpoint.get("info", "/api/student_works/:workId.json", {
      params: StudentWorkRequestParams,
      query: {
        coursesId: StringValue,
        categoryId: StringValue,
        userId: StringValue,
        history_id: StringValue,
        zzud: StringValue,
      },
      success: StudentWorkDetailResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("supplyAttachments", "/api/student_works/:workId/supply_attachments.json", {
      params: StudentWorkRequestParams,
      query: {
        coursesId: StringValue,
        categoryId: StringValue,
        userId: StringValue,
        zzud: StringValue,
      },
      success: SupplyAttachmentsResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("commentList", "/api/student_works/:workId/comment_list.json", {
      params: StudentWorkRequestParams,
      query: {
        is_invalid: StringValue,
        coursesId: StringValue,
        categoryId: StringValue,
        userId: StringValue,
        zzud: StringValue,
      },
      success: CommentListResponse,
    }),
  );
