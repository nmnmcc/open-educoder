import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const StringValue = Schema.String;
const IdFromString = Schema.NumberFromString.pipe(Schema.check(Schema.isInt()));
const ExamQuery = {
  coursesId: StringValue,
  categoryId: IdFromString,
  login: StringValue,
  zzud: StringValue,
};
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
  check_camera: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  is_ip_limit: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  ip_limit: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  ip_bind: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  ip_bind_type: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  last_ip: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  answered_open: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  screen_open: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  screen_shot_open: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  screen_num: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  screen_sec: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  used_screen_num: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  start_locked: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  is_user_locked: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  is_locked: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  open_score: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  is_commit: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  screen_at: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  open_total_score: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  exercise_user_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  show_pop: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  user_is_enter: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  can_start: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  exercise_type: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
});
/*
Sample: GET /api/exercises/198085/get_exercise_user_info.json
{
  "status": 0,
  "message": "success",
  "data": "<ExerciseInfoData>"
}

Error sample (no permission):
{
  "status": 409,
  "message": "您没有权限进入"
}
*/
const ExerciseInfoResponse = Schema.Struct({
  status: Schema.Int,
  message: Schema.String,
  data: Schema.optionalKey(Schema.NullishOr(ExerciseInfoData)),
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
  "left_time": 7200,
  "user_name": "<user>",
  "student_id": "<student id>",
  "used_screen_num": 0,
  "commit_status": 0,
  "can_start": true
}
*/
const Exercise = Schema.Struct({
  id: Schema.Int,
  exercise_name: Schema.String,
  exercise_description: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  is_random: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  screen_open: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  screen_num: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  screen_sec: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  time: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  left_time: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  user_name: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  student_id: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  used_screen_num: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  commit_status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  can_start: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
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
  user_answer_boolean: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
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
  "answer_text": "<blank answer>"
}
*/
const BlankUserAnswer = Schema.Struct({
  choice_id: Schema.Int,
  answer_text: Schema.String,
});
/*
Sample: GET /api/exercises/198085/start.json
[
  { "choice_id": 1, "answer_text": "<blank answer>" },
  "<free text answer>"
]
*/
const UserAnswer = Schema.Union([BlankUserAnswer, Schema.String]);
/*
Sample: GET /api/exercises/198085/start.json
{
  "question_num": 13,
  "question_id": 12263490,
  "question_title": "<question title>",
  "question_score": "4.0",
  "question_type": 3,
  "is_ordered": true,
  "no_space": true,
  "downcase": true,
  "multi_count": 1,
  "standard_answers": ["<StandardAnswer>"],
  "user_answer": ["<UserAnswer>"],
  "ques_status": 0,
  "question_choices": ["<QuestionChoice>"]
}
*/
const ExerciseQuestion = Schema.Struct({
  question_num: Schema.Int,
  question_id: Schema.Int,
  question_title: Schema.String,
  question_score: Schema.String,
  question_type: Schema.Int,
  repeat_answer: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  is_marked: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  is_ordered: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  no_space: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  downcase: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  multi_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  standard_answers: Schema.optionalKey(Schema.NullishOr(Schema.Array(StandardAnswer))),
  user_answer: Schema.optionalKey(Schema.NullishOr(Schema.Array(UserAnswer))),
  ques_status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  question_choices: Schema.optionalKey(Schema.NullishOr(Schema.Array(QuestionChoice))),
});
/*
Sample: GET /api/exercises/198085/start.json
{
  "question_type_id": 4,
  "question_type": 3,
  "count": 1,
  "name": "<question type name>",
  "score": "4.0",
  "items": ["<ExerciseQuestion>"],
  "sub_questions_count": 0
}
*/
const ExerciseQuestionType = Schema.Struct({
  question_type_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  question_type: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  name: Schema.String,
  score: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  items: Schema.Array(ExerciseQuestion),
  sub_questions_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
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

Error sample (no permission):
{
  "status": 409,
  "message": "您没有权限进入"
}
*/
const ExerciseStartResponse = Schema.Struct({
  status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  message: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  left_banner_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  left_banner_name: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  exercise: Schema.optionalKey(Schema.NullishOr(Exercise)),
  exercise_question_types: Schema.optionalKey(Schema.NullishOr(Schema.Array(ExerciseQuestionType))),
  exercise_types: Schema.optionalKey(Schema.NullishOr(ExerciseTypes)),
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
  answer_text: Schema.optionalKey(Schema.NullishOr(Schema.String)),
}).pipe(HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }));
/*
Sample: POST /api/exercise_questions/12263457/exercise_answers.json
{
  "status": 0,
  "message": "回答成功"
}
*/
const AnswerResponse = Schema.Struct({
  status: Schema.Int,
  message: Schema.String,
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

No-time-limit sample:
{
  "has_time": false,
  "left_time": null,
  "student_left_minutes": null,
  "user_end_time": null,
  "user_total_end_time": null
}
*/
const ExerciseTimeResponse = Schema.Struct({
  has_time: Schema.Boolean,
  left_time: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  student_left_minutes: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  user_end_time: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  user_total_end_time: Schema.optionalKey(Schema.NullishOr(Schema.String)),
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
  data: Schema.optionalKey(Schema.NullishOr(CommitResponseData)),
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
        zzud: StringValue,
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
        zzud: StringValue,
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
        zzud: StringValue,
      },
      payload: AnswerPayload,
      success: AnswerResponse,
    }),
  );
