import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const NonEmptyString = Schema.String.pipe(Schema.check(Schema.isMinLength(1)));

const TaskRequestParams = {
  taskId: NonEmptyString,
};

/*
.sample/homework1.har: POST /api/tasks/sflmr2fxi4wn/game_build.json
{
  "sec_key": "<sec_key>",
  "resubmit": "",
  "first": 1,
  "content_modified": 0,
  "shixun_environment_id": 1128633,
  "tab_type": 1,
  "extras": {
    "exercise_id": "",
    "question_id": "",
    "challenge_id": 3475325,
    "subject_id": "",
    "homework_common_id": "3487324",
    "competition_entry_id": "",
    "commitID": "<commit sha>",
    "currentUserId": 123
  }
}
*/
const GameBuildPayload = Schema.Struct({
  sec_key: NonEmptyString,
  resubmit: Schema.String,
  first: Schema.Int,
  content_modified: Schema.Int,
  shixun_environment_id: Schema.Int,
  tab_type: Schema.Int,
  extras: Schema.Struct({
    exercise_id: Schema.String,
    question_id: Schema.String,
    challenge_id: Schema.Int,
    subject_id: Schema.String,
    homework_common_id: NonEmptyString,
    competition_entry_id: Schema.String,
    commitID: NonEmptyString,
    currentUserId: Schema.Int,
  }),
}).pipe(HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }));

/*
.sample/homework1.har: POST /api/tasks/sflmr2fxi4wn/log_output
{
  "shixun_environment_id": 1128633,
  "tab_type": 1,
  "extras": {
    "homework_common_id": "3487324"
  }
}
*/
const LogOutputPayload = Schema.Struct({
  shixun_environment_id: Schema.Int,
  tab_type: Schema.Int,
  extras: Schema.Struct({
    homework_common_id: NonEmptyString,
  }),
}).pipe(HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }));

/*
.sample/homework1.har: GET /api/tasks/sflmr2fxi4wn/rep_content.json
{
  "content": {
    "content": "<base64>",
    "size": 122
  },
  "language": "shell",
  "file_type": "txt",
  "filename": "code.sh"
}
*/
const RepositoryContentResponse = Schema.Struct({
  content: Schema.Struct({
    content: Schema.String,
    size: Schema.Int,
  }),
  language: Schema.String,
  file_type: Schema.String,
  filename: Schema.String,
});

/*
.sample/homework1.har: GET /api/tasks/sflmr2fxi4wn/commit_files.json
{
  "status": 0,
  "message": "success"
}
*/
const SimpleResponse = Schema.Struct({
  status: Schema.Int,
  message: Schema.String,
});

/*
.sample/homework2.har: GET /api/tasks/sflmr2fxi4wn/reset_passed_code.json
{
  "content": "<file content>",
  "language": "shell"
}
*/
const ResetPassedCodeResponse = Schema.Struct({
  content: Schema.String,
  language: Schema.String,
});

export const Task = HttpApiGroup.make("Task")
  .add(
    HttpApiEndpoint.get("info", "/api/tasks/:taskId.json", {
      params: TaskRequestParams,
      query: {
        homework_common_id: NonEmptyString,
        zzud: NonEmptyString,
      },
      success: Schema.Json,
    }),
  )
  .add(
    HttpApiEndpoint.get("repContent", "/api/tasks/:taskId/rep_content.json", {
      params: TaskRequestParams,
      query: {
        path: NonEmptyString,
        homework_common_id: NonEmptyString,
        exercise_id: Schema.String,
        zzud: NonEmptyString,
      },
      success: RepositoryContentResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("logOutput", "/api/tasks/:taskId/log_output", {
      params: TaskRequestParams,
      query: {
        zzud: NonEmptyString,
      },
      payload: LogOutputPayload,
      success: Schema.Json,
    }),
  )
  .add(
    HttpApiEndpoint.post("gameBuild", "/api/tasks/:taskId/game_build.json", {
      params: TaskRequestParams,
      query: {
        zzud: NonEmptyString,
      },
      payload: GameBuildPayload,
      success: Schema.Json,
    }),
  )
  .add(
    HttpApiEndpoint.get("gameStatus", "/api/tasks/:taskId/game_status.json", {
      params: TaskRequestParams,
      query: {
        resubmit: Schema.String,
        time_out: Schema.Boolean,
        port: Schema.Int,
        sec_key: NonEmptyString,
        challenge_id: Schema.Int,
        subject_id: Schema.String,
        homework_common_id: NonEmptyString,
        zzud: NonEmptyString,
      },
      success: Schema.Json,
    }),
  )
  .add(
    HttpApiEndpoint.get("commitFiles", "/api/tasks/:taskId/commit_files.json", {
      params: TaskRequestParams,
      query: {
        shixun_environment_id: Schema.Int,
        zzud: NonEmptyString,
      },
      success: SimpleResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("pullFiles", "/api/tasks/:taskId/pull_files.json", {
      params: TaskRequestParams,
      query: {
        shixun_environment_id: Schema.Int,
        zzud: NonEmptyString,
      },
      success: SimpleResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("resetPassedCode", "/api/tasks/:taskId/reset_passed_code.json", {
      params: TaskRequestParams,
      query: {
        path: NonEmptyString,
        zzud: NonEmptyString,
      },
      success: ResetPassedCodeResponse,
    }),
  );
