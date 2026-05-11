import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const NonEmptyString = Schema.String.pipe(Schema.check(Schema.isMinLength(1)));

const TaskRequestParams = {
  taskId: NonEmptyString,
};

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

const LogOutputPayload = Schema.Struct({
  shixun_environment_id: Schema.Int,
  tab_type: Schema.Int,
  extras: Schema.Struct({
    homework_common_id: NonEmptyString,
  }),
}).pipe(HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }));

const RepositoryContentResponse = Schema.Struct({
  content: Schema.Struct({
    content: Schema.String,
    size: Schema.Int,
  }),
  language: Schema.String,
  file_type: Schema.String,
  filename: Schema.String,
});

const SimpleResponse = Schema.Struct({
  status: Schema.Int,
  message: Schema.String,
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
  );
