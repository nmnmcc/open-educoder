import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const NonEmptyString = Schema.String.pipe(Schema.check(Schema.isMinLength(1)));
const IdFromString = Schema.NumberFromString.pipe(Schema.check(Schema.isInt()));
const NullableString = Schema.NullOr(Schema.String);
const NullableBoolean = Schema.NullOr(Schema.Boolean);
const EmptyArray = Schema.Array(Schema.Never);
const ExamQuery = {
  coursesId: NonEmptyString,
  categoryId: IdFromString,
  login: NonEmptyString,
  zzud: NonEmptyString,
};
/*
Sample: GET /api/exercises/198085/start.json
{
  "id": 397176,
  "reminder_time": 30,
  "reminder_content": "<reminder text>"
}
*/
const ExerciseEvent = Schema.Struct({
  id: Schema.Int,
  reminder_time: Schema.Int,
  reminder_content: Schema.String,
});
/*
Sample: GET /api/exercises/198085/get_exercise_user_info.json
{
  "check_camera": false,
  "is_ip_limit": false,
  "ip_limit": "no",
  "ip_bind": false,
  "ip_bind_type": false,
  "last_ip": null,
  "answered_open": true,
  "screen_open": false,
  "screen_shot_open": false,
  "screen_num": 3,
  "screen_sec": 5,
  "used_screen_num": 0,
  "start_locked": false,
  "is_user_locked": true,
  "is_locked": false,
  "open_score": false,
  "is_commit": false,
  "screen_at": null,
  "open_total_score": true,
  "exercise_user_id": 30414202,
  "show_pop": true,
  "user_is_enter": false,
  "can_start": true,
  "exercise_type": 1
}
*/
const ExerciseInfoData = Schema.Struct({
  check_camera: Schema.Boolean,
  is_ip_limit: Schema.Boolean,
  ip_limit: Schema.String,
  ip_bind: Schema.Boolean,
  ip_bind_type: Schema.Boolean,
  last_ip: NullableString,
  answered_open: Schema.Boolean,
  screen_open: Schema.Boolean,
  screen_shot_open: Schema.Boolean,
  screen_num: Schema.Int,
  screen_sec: Schema.Int,
  used_screen_num: Schema.Int,
  start_locked: Schema.Boolean,
  is_user_locked: Schema.Boolean,
  is_locked: Schema.Boolean,
  open_score: Schema.Boolean,
  is_commit: Schema.Boolean,
  screen_at: NullableString,
  open_total_score: Schema.Boolean,
  exercise_user_id: Schema.Int,
  show_pop: Schema.Boolean,
  user_is_enter: Schema.Boolean,
  can_start: Schema.Boolean,
  exercise_type: Schema.Int,
});
/*
Sample: GET /api/exercises/198085/get_exercise_user_info.json
{
  "status": 0,
  "message": "success",
  "data": "<ExerciseInfoData>"
}
*/
const ExerciseInfoResponse = Schema.Struct({
  status: Schema.Int,
  message: Schema.String,
  data: ExerciseInfoData,
});
/*
Sample: GET /api/exercises/198085/start.json
{
  "id": 198085,
  "exercise_name": "<exercise name>",
  "exercise_description": null,
  "is_random": true,
  "screen_open": false,
  "screen_num": 3,
  "screen_sec": 5,
  "time": 120,
  "ip_limit": "no",
  "ip_bind": false,
  "ip_bind_type": false,
  "forbid_copy": true,
  "question_random": false,
  "choice_random": false,
  "open_phone_video_recording": false,
  "forbid_virtual": false,
  "forbid_screen": false,
  "screen_key": "946258",
  "use_white_list": false,
  "white_list": [],
  "net_limit": false,
  "net_limit_list": null,
  "show_acm": false,
  "hack_rank_rule": 0,
  "punish_time": 0,
  "open_code": false,
  "open_code_type": 0,
  "rank_forbidden": false,
  "rank_forbidden_start": null,
  "rank_forbidden_end": null,
  "unlimit_user_ids": [],
  "only_on_client": false,
  "have_hacks": false,
  "unlimit_users": [],
  "left_time": 7200,
  "is_unlimit_user": false,
  "user_name": "<user>",
  "student_id": "<student id>",
  "open_camera": false,
  "used_screen_num": 0,
  "commit_status": 0,
  "can_start": true,
  "exercise_events": ["<ExerciseEvent>"]
}
*/
const Exercise = Schema.Struct({
  id: Schema.Int,
  exercise_name: Schema.String,
  exercise_description: NullableString,
  is_random: Schema.Boolean,
  screen_open: Schema.Boolean,
  screen_num: Schema.Int,
  screen_sec: Schema.Int,
  time: Schema.Int,
  ip_limit: Schema.String,
  ip_bind: Schema.Boolean,
  ip_bind_type: Schema.Boolean,
  forbid_copy: Schema.Boolean,
  question_random: Schema.Boolean,
  choice_random: Schema.Boolean,
  open_phone_video_recording: Schema.Boolean,
  forbid_virtual: Schema.Boolean,
  forbid_screen: Schema.Boolean,
  screen_key: NullableString,
  use_white_list: Schema.Boolean,
  white_list: EmptyArray,
  net_limit: Schema.Boolean,
  net_limit_list: Schema.NullOr(EmptyArray),
  show_acm: Schema.Boolean,
  hack_rank_rule: Schema.Int,
  punish_time: Schema.Number,
  open_code: Schema.Boolean,
  open_code_type: Schema.Int,
  rank_forbidden: Schema.Boolean,
  rank_forbidden_start: NullableString,
  rank_forbidden_end: NullableString,
  unlimit_user_ids: Schema.Array(Schema.Int),
  only_on_client: Schema.Boolean,
  have_hacks: Schema.Boolean,
  unlimit_users: EmptyArray,
  left_time: Schema.Int,
  is_unlimit_user: Schema.Boolean,
  user_name: Schema.String,
  student_id: Schema.String,
  open_camera: Schema.Boolean,
  used_screen_num: Schema.Int,
  commit_status: Schema.Int,
  can_start: Schema.Boolean,
  exercise_events: Schema.Array(ExerciseEvent),
});
/*
Sample: GET /api/exercises/198085/start.json
{
  "choice_id": 35397428,
  "choice_text": "<choice text>",
  "choice_position": 1,
  "user_answer_boolean": false
}
*/
const QuestionChoice = Schema.Struct({
  choice_id: Schema.Int,
  choice_text: Schema.String,
  choice_position: Schema.Int,
  user_answer_boolean: Schema.Boolean,
});
/*
Sample: GET /api/exercises/198085/start.json
{
  "model": 1,
  "position": 1
}
*/
const StandardAnswer = Schema.Struct({
  model: Schema.Int,
  position: Schema.Int,
});
/*
Sample: GET /api/exercises/198085/start.json
{
  "choice_id": 1,
  "answer_text": "<answer text>"
}
*/
const UserAnswerChoice = Schema.Struct({
  choice_id: Schema.Int,
  answer_text: Schema.String,
});
/*
Sample: GET /api/exercises/198085/start.json
[
  "<text answer>"
]
*/
const UserAnswer = Schema.Array(Schema.Union([Schema.String, UserAnswerChoice]));
/*
Sample: GET /api/exercises/198085/start.json
{
  "question_num": 13,
  "question_id": 12263490,
  "question_title": "<question title>",
  "question_score": "4.0",
  "question_type": 3,
  "repeat_answer": true,
  "is_marked": null,
  "question_choices": ["<QuestionChoice>"],
  "is_ordered": true,
  "no_space": true,
  "downcase": true,
  "multi_count": 1,
  "standard_answers": ["<StandardAnswer>"],
  "user_answer": [],
  "ques_status": 0
}
*/
const ExerciseQuestion = Schema.Struct({
  question_num: Schema.Int,
  question_id: Schema.Int,
  question_title: Schema.String,
  question_score: Schema.String,
  question_type: Schema.Int,
  repeat_answer: Schema.Boolean,
  is_marked: Schema.optionalKey(NullableBoolean),
  question_choices: Schema.optionalKey(Schema.Array(QuestionChoice)),
  is_ordered: Schema.optionalKey(Schema.Boolean),
  no_space: Schema.optionalKey(Schema.Boolean),
  downcase: Schema.optionalKey(Schema.Boolean),
  multi_count: Schema.optionalKey(Schema.Int),
  standard_answers: Schema.optionalKey(Schema.Array(StandardAnswer)),
  user_answer: Schema.optionalKey(UserAnswer),
  ques_status: Schema.Int,
});
/*
Sample: GET /api/exercises/198085/start.json
{
  "question_type_id": 1,
  "question_type": 0,
  "count": 10,
  "name": "<question type name>",
  "score": "40.0",
  "items": ["<ExerciseQuestion>"],
  "sub_questions_count": 0
}
*/
const ExerciseQuestionType = Schema.Struct({
  question_type_id: Schema.Int,
  question_type: Schema.Int,
  count: Schema.Int,
  name: Schema.String,
  score: Schema.String,
  items: Schema.Array(ExerciseQuestion),
  sub_questions_count: Schema.Int,
});
/*
Sample: GET /api/exercises/198085/start.json
{
  "q_counts": 17,
  "q_scores": "100.0"
}
*/
const ExerciseTypes = Schema.Struct({
  q_counts: Schema.Int,
  q_scores: Schema.String,
});
/*
Sample: GET /api/exercises/198085/start.json
{
  "left_banner_id": 1809409,
  "left_banner_name": "<banner name>",
  "exercise": "<Exercise>",
  "exercise_question_types": ["<ExerciseQuestionType>"],
  "exercise_types": "<ExerciseTypes>"
}
*/
const ExerciseStartResponse = Schema.Struct({
  left_banner_id: Schema.Int,
  left_banner_name: Schema.String,
  exercise: Exercise,
  exercise_question_types: Schema.Array(ExerciseQuestionType),
  exercise_types: ExerciseTypes,
});
/*
Sample: POST /api/exercise_questions/12263457/exercise_answers.json
{
  "questionId": 12263457,
  "exercise_choice_id": 35397429,
  "answer_text": null
}
*/
const AnswerPayload = Schema.Struct({
  questionId: Schema.Int,
  exercise_choice_id: Schema.Union([Schema.Int, Schema.Array(Schema.Int)]),
  answer_text: Schema.NullOr(Schema.String),
}).pipe(HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }));
/*
Sample: POST /api/exercise_questions/12263457/exercise_answers.json
{
  "status": 0,
  "message": "回答成功",
  "alert": []
}
*/
const AnswerResponse = Schema.Struct({
  status: Schema.Int,
  message: Schema.String,
  alert: Schema.optional(EmptyArray),
});
/*
Sample: GET /api/exercises/198085/exercise_time.json
{
  "has_time": true,
  "left_time": 1481,
  "student_left_minutes": 24,
  "user_end_time": "2026-05-11 11:22:12",
  "user_total_end_time": "2026-06-30T00:18:00.000+08:00"
}
*/
const ExerciseTimeResponse = Schema.Struct({
  has_time: Schema.Boolean,
  left_time: Schema.Int,
  student_left_minutes: Schema.Int,
  user_end_time: Schema.String,
  user_total_end_time: Schema.String,
});
/*
Sample: GET /api/exercises/198085/begin_commit.json
{
  "shixun_undo": 0,
  "question_undo": 0,
  "oj_undo": 0,
  "end_time": "2026-05-11T11:22:12.387+08:00"
}
*/
const BeginCommitResponse = Schema.Struct({
  shixun_undo: Schema.Int,
  question_undo: Schema.Int,
  oj_undo: Schema.Int,
  end_time: Schema.String,
});
/*
Sample: POST /api/exercises/198085/commit_exercise.json
{
  "categoryId": "198085",
  "commit_method": 1
}
*/
const CommitPayload = Schema.Struct({
  categoryId: IdFromString,
  commit_method: Schema.Int,
}).pipe(HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }));
/*
Sample: POST /api/exercises/198085/commit_exercise.json
{
  "commit_time": "2026-05-11 10:57:36",
  "user_exercise_time": "1时 35分 24秒"
}
*/
const CommitResponseData = Schema.Struct({
  commit_time: Schema.String,
  user_exercise_time: Schema.String,
});
/*
Sample: POST /api/exercises/198085/commit_exercise.json
{
  "status": 0,
  "message": "试卷提交成功！",
  "data": "<CommitResponseData>"
}
*/
const CommitResponse = Schema.Struct({
  status: Schema.Int,
  message: Schema.String,
  data: Schema.optionalKey(CommitResponseData),
});

export const Exam = HttpApiGroup.make("Exam")
  .add(
    HttpApiEndpoint.get("info", "/api/exercises/:examId/get_exercise_user_info.json", {
      params: {
        examId: IdFromString,
      },
      query: ExamQuery,
      success: ExerciseInfoResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("start", "/api/exercises/:examId/start.json", {
      params: {
        examId: IdFromString,
      },
      query: ExamQuery,
      success: ExerciseStartResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("time", "/api/exercises/:examId/exercise_time.json", {
      params: {
        examId: IdFromString,
      },
      query: ExamQuery,
      success: ExerciseTimeResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("beginCommit", "/api/exercises/:examId/begin_commit.json", {
      params: {
        examId: IdFromString,
      },
      query: {
        id: IdFromString,
        zzud: NonEmptyString,
      },
      success: BeginCommitResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("commit", "/api/exercises/:examId/commit_exercise.json", {
      params: {
        examId: IdFromString,
      },
      query: {
        zzud: NonEmptyString,
      },
      payload: CommitPayload,
      success: CommitResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("answer", "/api/exercise_questions/:questionId/exercise_answers.json", {
      params: {
        questionId: IdFromString,
      },
      query: {
        zzud: NonEmptyString,
      },
      payload: AnswerPayload,
      success: AnswerResponse,
    }),
  );
