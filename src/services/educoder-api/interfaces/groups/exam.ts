import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const NonEmptyString = Schema.String.pipe(Schema.check(Schema.isMinLength(1)));
const IdFromString = Schema.NumberFromString.pipe(Schema.check(Schema.isInt()));
const NullableString = Schema.NullOr(Schema.String);
const NullableBoolean = Schema.NullOr(Schema.Boolean);
const JsonArray = Schema.Array(Schema.Json);
const ExamQuery = {
  coursesId: NonEmptyString,
  categoryId: IdFromString,
  login: NonEmptyString,
  zzud: NonEmptyString,
};
const ExerciseEvent = Schema.Struct({
  id: Schema.Int,
  reminder_time: Schema.Int,
  reminder_content: Schema.String,
});
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
const ExerciseInfoResponse = Schema.Struct({
  status: Schema.Int,
  message: Schema.String,
  data: ExerciseInfoData,
});
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
  white_list: JsonArray,
  net_limit: Schema.Boolean,
  net_limit_list: Schema.NullOr(JsonArray),
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
  unlimit_users: JsonArray,
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
const QuestionChoice = Schema.Struct({
  choice_id: Schema.Int,
  choice_text: Schema.String,
  choice_position: Schema.Int,
  user_answer_boolean: Schema.Boolean,
});
const StandardAnswer = Schema.Struct({
  model: Schema.Int,
  position: Schema.Int,
});
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
  user_answer: Schema.optionalKey(JsonArray),
  ques_status: Schema.Int,
});
const ExerciseQuestionType = Schema.Struct({
  question_type_id: Schema.Int,
  question_type: Schema.Int,
  count: Schema.Int,
  name: Schema.String,
  score: Schema.String,
  items: Schema.Array(ExerciseQuestion),
  sub_questions_count: Schema.Int,
});
const ExerciseTypes = Schema.Struct({
  q_counts: Schema.Int,
  q_scores: Schema.String,
});
const ExerciseStartResponse = Schema.Struct({
  left_banner_id: Schema.Int,
  left_banner_name: Schema.String,
  exercise: Exercise,
  exercise_question_types: Schema.Array(ExerciseQuestionType),
  exercise_types: ExerciseTypes,
});
const AnswerPayload = Schema.Struct({
  questionId: Schema.Int,
  exercise_choice_id: Schema.NullOr(Schema.Union([Schema.Int, Schema.Array(Schema.Int)])),
  answer_text: Schema.NullOr(Schema.Union([Schema.String, Schema.Array(Schema.String)])),
}).pipe(HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }));
const AnswerResponse = Schema.Struct({
  status: Schema.Int,
  message: Schema.String,
  alert: Schema.optional(JsonArray),
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
