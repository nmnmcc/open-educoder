import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const NonEmptyString = Schema.String.pipe(Schema.check(Schema.isMinLength(1)));
const NullableString = Schema.NullOr(Schema.String);
const NullableNumber = Schema.NullOr(Schema.Number);
const NullableBoolean = Schema.NullOr(Schema.Boolean);

const TaskRequestParams = {
  taskId: NonEmptyString,
};

/*
Sample: POST /api/tasks/sflmr2fxi4wn/game_build.json
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
Sample: POST /api/tasks/sflmr2fxi4wn/log_output
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
Sample: GET /api/tasks/sflmr2fxi4wn/rep_content.json
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
Sample: GET /api/tasks/sflmr2fxi4wn/commit_files.json
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
Sample: GET /api/tasks/sflmr2fxi4wn/reset_passed_code.json
{
  "content": "<file content>",
  "language": "shell"
}
*/
const ResetPassedCodeResponse = Schema.Struct({
  content: Schema.String,
  language: Schema.String,
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{
  "id": 224796106,
  "identifier": "sflmr2fxi4wn",
  "myshixun_id": 64773861,
  "challenge_id": 3475325,
  "status": 0,
  "final_score": 0,
  "cost_time": 0
}
*/
const TaskGame = Schema.Struct({
  id: Schema.optionalKey(Schema.Int),
  identifier: Schema.optionalKey(Schema.String),
  myshixun_id: Schema.optionalKey(Schema.Int),
  challenge_id: Schema.optionalKey(Schema.Int),
  status: Schema.optionalKey(Schema.Int),
  final_score: Schema.optionalKey(Schema.Number),
  cost_time: Schema.optionalKey(Schema.Number),
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{
  "id": 3475325,
  "position": 1,
  "subject": "<challenge title>",
  "score": 100,
  "path": "case1/code.sh",
  "difficulty": 1,
  "exec_time": 3
}
*/
const TaskChallenge = Schema.Struct({
  id: Schema.optionalKey(Schema.Int),
  position: Schema.optionalKey(Schema.Int),
  subject: Schema.optionalKey(Schema.String),
  score: Schema.optionalKey(Schema.Number),
  path: Schema.optionalKey(Schema.String),
  difficulty: Schema.optionalKey(Schema.Int),
  exec_time: Schema.optionalKey(Schema.Int),
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{
  "id": 93321,
  "identifier": "e6fhjnqx",
  "name": "<shixun name>",
  "language": "shell",
  "status": 2,
  "open_local_evaluate": true
}
*/
const TaskShixun = Schema.Struct({
  id: Schema.optionalKey(Schema.Int),
  identifier: Schema.optionalKey(Schema.String),
  name: Schema.optionalKey(Schema.String),
  language: Schema.optionalKey(Schema.String),
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{
  "id": 64773861,
  "identifier": "iwk6hzbgyf",
  "commit_id": "<commit sha>",
  "status": 0,
  "repo_name": "<repo name>"
}
*/
const TaskMyshixun = Schema.Struct({
  id: Schema.optionalKey(Schema.Int),
  identifier: Schema.optionalKey(Schema.String),
  commit_id: Schema.optionalKey(Schema.String),
  status: Schema.optionalKey(Schema.Int),
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{
  "user_id": 2905482,
  "login": "pl2kfhv6g",
  "name": "<user>",
  "school": "<school>"
}
*/
const TaskUser = Schema.Struct({
  user_id: Schema.optionalKey(Schema.Int),
  login: Schema.optionalKey(Schema.String),
  name: Schema.optionalKey(Schema.String),
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{
  "shixun_environment_id": 1128633,
  "name": "<environment>",
  "tab_type": 1,
  "resource_type": 1,
  "tpi_type": 1
}
*/
const ShixunEnvironment = Schema.Struct({
  shixun_environment_id: Schema.optionalKey(Schema.Int),
  name: Schema.optionalKey(Schema.String),
  tab_type: Schema.optionalKey(Schema.Int),
  resource_type: Schema.optionalKey(Schema.Int),
  tpi_type: Schema.optionalKey(Schema.Int),
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{
  "is_public": true,
  "result": null,
  "output": "<expected output>",
  "actual_output": null,
  "matchRule": "full"
}
*/
const TaskTestSet = Schema.Struct({
  output: Schema.optionalKey(Schema.String),
  actual_output: Schema.optionalKey(NullableString),
  result: Schema.optionalKey(NullableBoolean),
  is_public: Schema.optionalKey(Schema.Boolean),
  matchRule: Schema.optionalKey(Schema.String),
  compile_success: Schema.optionalKey(NullableNumber),
  ts_mem: Schema.optionalKey(NullableNumber),
  ts_time: Schema.optionalKey(NullableNumber),
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{ "shixun_environment_id": 1128633 }
*/
const CodeEditor = Schema.Struct({
  shixun_environment_id: Schema.optionalKey(Schema.Int),
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{
  "st": 0,
  "discusses_count": 0,
  "game_count": 1,
  "game": "<TaskGame>",
  "challenge": "<TaskChallenge>",
  "shixun": "<TaskShixun>",
  "myshixun": "<TaskMyshixun>",
  "shixun_environments": ["<ShixunEnvironment>"],
  "test_sets": ["<TaskTestSet>"]
}
*/
const TaskInfoResponse = Schema.Struct({
  game_count: Schema.optionalKey(Schema.Int),
  prev_game: Schema.optionalKey(NullableString),
  next_game: Schema.optionalKey(NullableString),
  game: TaskGame,
  challenge: TaskChallenge,
  myshixun: TaskMyshixun,
  shixun: Schema.optionalKey(TaskShixun),
  user: Schema.optionalKey(TaskUser),
  homework_common_id: Schema.optionalKey(Schema.Int),
  homework_common_name: Schema.optionalKey(Schema.String),
  homework_common_is_end: Schema.optionalKey(Schema.Boolean),
  shixun_environments: Schema.optionalKey(Schema.Array(ShixunEnvironment)),
  test_sets: Schema.optionalKey(Schema.Array(TaskTestSet)),
  shixun_status: Schema.optionalKey(Schema.Int),
  code_editor: Schema.optionalKey(CodeEditor),
});

/*
Sample: POST /api/tasks/sflmr2fxi4wn/log_output
{
  "status": 0,
  "message": "success",
  "data": {
    "wss_url": "wss://<websocket-url>"
  }
}
*/
const LogOutputResponse = Schema.Struct({
  status: Schema.optionalKey(Schema.Int),
  message: Schema.optionalKey(Schema.String),
  data: Schema.optionalKey(
    Schema.Struct({
      wss_url: Schema.optionalKey(Schema.String),
    }),
  ),
});

/*
Sample: POST /api/tasks/sflmr2fxi4wn/game_build.json
{
  "code": 0,
  "msg": "<message>",
  "success": true
}
*/
const GameBuildNestedResponse = Schema.Struct({
  code: Schema.optionalKey(Schema.Int),
  msg: Schema.optionalKey(Schema.String),
  success: Schema.optionalKey(Schema.Boolean),
  data: Schema.optionalKey(
    Schema.Struct({
      port: Schema.optionalKey(Schema.Int),
      wssUrl: Schema.optionalKey(Schema.String),
    }),
  ),
});

/*
Sample: POST /api/tasks/sflmr2fxi4wn/game_build.json
{
  "status": 0,
  "resubmit": null,
  "position": 1,
  "port": 0,
  "had_done": 0,
  "tpi_id": "sflmr2fxi4wn"
}
*/
const GameBuildResponse = Schema.Struct({
  status: Schema.optionalKey(Schema.Int),
  resubmit: Schema.optionalKey(NullableString),
  position: Schema.optionalKey(Schema.Int),
  port: Schema.optionalKey(Schema.Int),
  had_done: Schema.optionalKey(Schema.Int),
  tpi_id: Schema.optionalKey(Schema.String),
  code: Schema.optionalKey(NullableString),
  res: Schema.optionalKey(GameBuildNestedResponse),
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn/game_status.json
{
  "running_code_status": 1,
  "running_code_message": "<status message>"
}
*/
const GameStatusRunningResponse = Schema.Struct({
  running_code_status: Schema.Int,
  running_code_message: Schema.String,
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn/game_status.json
{
  "grade": 100,
  "gold": 0,
  "experience": 0,
  "status": 2,
  "test_sets": ["<TaskTestSet>"],
  "sec_key": "<sec_key>",
  "test_sets_count": 1
}
*/
const GameStatusResultResponse = Schema.Struct({
  status: Schema.Int,
  grade: Schema.optionalKey(Schema.Number),
  gold: Schema.optionalKey(Schema.Int),
  experience: Schema.optionalKey(Schema.Int),
  position: Schema.optionalKey(Schema.Int),
  test_sets: Schema.optionalKey(Schema.Array(TaskTestSet)),
  last_compile_output: Schema.optionalKey(Schema.String),
  sec_key: Schema.optionalKey(Schema.String),
  test_sets_count: Schema.optionalKey(Schema.Int),
  sets_error_count: Schema.optionalKey(Schema.Int),
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn/game_status.json
{ "running_code_status": 1, "running_code_message": "<status message>" }
*/
const GameStatusResponse = Schema.Union([GameStatusRunningResponse, GameStatusResultResponse]);

export const Task = HttpApiGroup.make("Task")
  .add(
    HttpApiEndpoint.get("info", "/api/tasks/:taskId.json", {
      params: TaskRequestParams,
      query: {
        homework_common_id: NonEmptyString,
        zzud: NonEmptyString,
      },
      success: TaskInfoResponse,
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
      success: LogOutputResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("gameBuild", "/api/tasks/:taskId/game_build.json", {
      params: TaskRequestParams,
      query: {
        zzud: NonEmptyString,
      },
      payload: GameBuildPayload,
      success: GameBuildResponse,
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
      success: GameStatusResponse,
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
