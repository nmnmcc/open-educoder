import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const NonEmptyString = Schema.String.pipe(Schema.check(Schema.isMinLength(1)));
const NullableString = Schema.NullishOr(Schema.String);

const MyshixunRequestParams = {
  myshixunId: NonEmptyString,
};

/*
.sample/homework2.har: POST /api/myshixuns/iwk6hzbgyf/reset_repository.json
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
.sample/homework1.har: POST /api/myshixuns/iwk6hzbgyf/update_file.json
{
  "path": "case1/code.sh",
  "evaluate": 0,
  "content": "<file content>",
  "game_id": 224796106,
  "tab_type": 1,
  "exercise_id": null,
  "homework_common_id": "3487324",
  "extras": {
    "exercise_id": "",
    "question_id": "",
    "challenge_id": 3475325,
    "subject_id": "",
    "homework_common_id": "3487324",
    "competition_entry_id": "",
    "currentUserId": 123
  }
}
*/
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

/*
.sample/homework1.har: POST /api/myshixuns/iwk6hzbgyf/update_file.json
{
  "content": {
    "commitID": "<commit sha>",
    "content": "<base64>",
    "size": 127
  },
  "resubmit": "",
  "sec_key": "",
  "content_modified": 0
}
*/
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

/*
.sample/homework2.har: POST /api/myshixuns/iwk6hzbgyf/reset_repository.json
{
  "challenge_id": 3475325,
  "homework_common_id": "3487324"
}
*/
const ResetRepositoryPayload = Schema.Struct({
  challenge_id: Schema.Int,
  homework_common_id: NonEmptyString,
}).pipe(HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }));

/*
.sample/homework2.har: POST /api/myshixuns/iwk6hzbgyf/repository.json
{}
*/
const RepositoryPayload = Schema.Struct({
  path: Schema.optionalKey(Schema.String),
}).pipe(HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }));

/*
.sample/homework2.har: POST /api/myshixuns/iwk6hzbgyf/repository.json
{
  "trees": [
    {
      "name": "case1",
      "type": "tree"
    }
  ]
}
*/
const RepositoryResponse = Schema.Struct({
  trees: Schema.Array(
    Schema.Struct({
      name: Schema.String,
      type: Schema.String,
    }),
  ),
});

/*
.sample/homework1.har: GET /api/myshixuns/64773861/version_repository_delete.json
{
  "status": 0,
  "message": "success",
  "delete_expired": false
}
*/
const VersionRepositoryDeleteResponse = Schema.Struct({
  status: Schema.Int,
  message: Schema.String,
  delete_expired: Schema.Boolean,
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
  )
  .add(
    HttpApiEndpoint.get("getRemainingTime", "/api/myshixuns/:myshixunId/get_remaining_time.json", {
      params: MyshixunRequestParams,
      query: {
        zzud: NonEmptyString,
      },
      success: Schema.Json,
    }),
  )
  .add(
    HttpApiEndpoint.get("versionRepositoryDelete", "/api/myshixuns/:myshixunId/version_repository_delete.json", {
      params: MyshixunRequestParams,
      query: {
        zzud: NonEmptyString,
      },
      success: VersionRepositoryDeleteResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("resetRepository", "/api/myshixuns/:myshixunId/reset_repository.json", {
      params: MyshixunRequestParams,
      query: {
        zzud: NonEmptyString,
      },
      payload: ResetRepositoryPayload,
      success: SimpleResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("repository", "/api/myshixuns/:myshixunId/repository.json", {
      params: MyshixunRequestParams,
      query: {
        zzud: NonEmptyString,
      },
      payload: RepositoryPayload,
      success: RepositoryResponse,
    }),
  );
