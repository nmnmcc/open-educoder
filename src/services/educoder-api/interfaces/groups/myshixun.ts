import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const NonEmptyString = Schema.String.pipe(Schema.check(Schema.isMinLength(1)));
const NullableString = Schema.NullishOr(Schema.String);

const MyshixunRequestParams = {
  myshixunId: NonEmptyString,
};

const UpdateFilePayload = Schema.Struct({
  path: NonEmptyString,
  evaluate: Schema.Int,
  content: Schema.String,
  game_id: Schema.Int,
  tab_type: Schema.Int,
  exercise_id: Schema.NullishOr(Schema.String),
  homework_common_id: NonEmptyString,
  extras: Schema.Struct({
    exercise_id: Schema.String,
    question_id: Schema.String,
    challenge_id: Schema.Int,
    subject_id: Schema.String,
    homework_common_id: NonEmptyString,
    competition_entry_id: Schema.String,
    currentUserId: Schema.Int,
  }),
}).pipe(HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }));

const UpdateFileResponse = Schema.Struct({
  content: Schema.Struct({
    commitID: Schema.String,
    content: Schema.String,
    size: Schema.Int,
  }),
  resubmit: NullableString,
  sec_key: NullableString,
  content_modified: Schema.Int,
});

export const Myshixun = HttpApiGroup.make("Myshixun")
  .add(
    HttpApiEndpoint.post("updateFile", "/api/myshixuns/:myshixunId/update_file.json", {
      params: MyshixunRequestParams,
      query: {
        zzud: NonEmptyString,
      },
      payload: UpdateFilePayload,
      success: UpdateFileResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("start", "/api/myshixuns/:myshixunId/start.json", {
      params: MyshixunRequestParams,
      query: {
        shixun_environment_id: Schema.Int,
        tab_type: Schema.Int,
        game_id: Schema.Int,
        homework_common_id: NonEmptyString,
        zzud: NonEmptyString,
      },
      success: Schema.Json,
    }),
  );
