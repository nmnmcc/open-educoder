import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const StringValue = Schema.String;

const TaskRequestParams = {
  taskId: StringValue,
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
  sec_key: StringValue,
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
    homework_common_id: StringValue,
    competition_entry_id: Schema.String,
    commitID: StringValue,
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
    homework_common_id: StringValue,
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
  id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  identifier: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  myshixun_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  challenge_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  final_score: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  cost_time: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{
  "id": 3475325,
  "position": 1,
  "subject": "<challenge title>",
  "task_pass": "####任务描述\n<markdown learning content>",
  "score": 100,
  "path": "case1/code.sh",
  "difficulty": 1,
  "exec_time": 3
}
*/
const TaskChallenge = Schema.Struct({
  id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  position: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  subject: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  task_pass: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  score: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  path: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  difficulty: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  exec_time: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{
  "id": 93321,
  "identifier": "e6fhjnqx",
  "name": "<shixun name>",
  "language": "shell"
}
*/
const TaskShixun = Schema.Struct({
  id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  identifier: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  name: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  language: Schema.optionalKey(Schema.NullishOr(Schema.String)),
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{
  "id": 64773861,
  "identifier": "iwk6hzbgyf",
  "commit_id": "<commit sha>",
  "status": 0
}
*/
const TaskMyshixun = Schema.Struct({
  id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  identifier: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  commit_id: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{
  "user_id": 2905482,
  "login": "pl2kfhv6g",
  "name": "<user>"
}
*/
const TaskUser = Schema.Struct({
  user_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  login: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  name: Schema.optionalKey(Schema.NullishOr(Schema.String)),
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
  shixun_environment_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  name: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  tab_type: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  resource_type: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  tpi_type: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
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
  output: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  actual_output: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  result: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  is_public: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  matchRule: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  compile_success: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  ts_mem: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  ts_time: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
});

/*
Sample: POST /api/tasks/a4pem8lvfqgx/choose_build.json
{ "answer": [["<blank answer>"], "true", "C"] }
*/
const ChoiceAnswer = Schema.Union([Schema.String, Schema.Array(Schema.String)]);

/*
Sample: GET /api/tasks/a4pem8lvfqgx.json
{ "option_name": "<option text>", "position": 0 }
*/
const ChallengeQuestionOption = Schema.Struct({
  option_name: Schema.String,
  position: Schema.Int,
});

/*
Sample: GET /api/tasks/a4pem8lvfqgx.json
{
  "challenge_id": 965834,
  "subject": "<question text>",
  "position": 7,
  "category": 1,
  "question_type": 0,
  "question_name": "单选题/多选题",
  "challenge_choose_id": 239016,
  "challenge_question": [{ "option_name": "<option text>", "position": 0 }]
}
*/
const TaskChoice = Schema.Struct({
  challenge_id: Schema.Int,
  subject: Schema.String,
  position: Schema.Int,
  category: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  question_type: Schema.Int,
  question_name: Schema.String,
  challenge_choose_id: Schema.Int,
  multi_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  challenge_question: Schema.optionalKey(Schema.NullishOr(Schema.Array(ChallengeQuestionOption))),
});

/*
Sample: POST /api/tasks/a4pem8lvfqgx/choose_build.json
{
  "result": null,
  "actual_output": ["<blank answer>"],
  "standard_answer": null,
  "question_type": 3,
  "question_name": "填空题",
  "position": 1
}
*/
const ChoiceTestCase = Schema.Struct({
  result: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  actual_output: Schema.optionalKey(Schema.NullishOr(ChoiceAnswer)),
  standard_answer: Schema.optionalKey(Schema.NullishOr(ChoiceAnswer)),
  question_type: Schema.Int,
  question_name: Schema.String,
  position: Schema.Int,
});

/*
Sample: GET /api/tasks/a4pem8lvfqgx.json
{
  "had_submmit": false,
  "challenge_chooses_count": 16,
  "choose_correct_num": null,
  "test_sets": ["<ChoiceTestCase>"],
  "had_all_submmit": false
}
*/
const ChooseTestCases = Schema.Struct({
  had_submmit: Schema.Boolean,
  challenge_chooses_count: Schema.Int,
  choose_correct_num: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  test_sets: Schema.Array(ChoiceTestCase),
  had_all_submmit: Schema.Boolean,
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{ "shixun_environment_id": 1128633 }
*/
const CodeEditor = Schema.Struct({
  shixun_environment_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{
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
  game_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  prev_game: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  next_game: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  game: TaskGame,
  challenge: TaskChallenge,
  myshixun: TaskMyshixun,
  shixun: Schema.optionalKey(Schema.NullishOr(TaskShixun)),
  user: Schema.optionalKey(Schema.NullishOr(TaskUser)),
  homework_common_id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  homework_common_name: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  homework_common_is_end: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  shixun_environments: Schema.optionalKey(Schema.NullishOr(Schema.Array(ShixunEnvironment))),
  test_sets: Schema.optionalKey(Schema.NullishOr(Schema.Array(TaskTestSet))),
  shixun_status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  code_editor: Schema.optionalKey(Schema.NullishOr(CodeEditor)),
  has_answer: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  choose_test_cases: Schema.optionalKey(Schema.NullishOr(ChooseTestCases)),
  chooses: Schema.optionalKey(Schema.NullishOr(Schema.Array(TaskChoice))),
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
  status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  message: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  data: Schema.optionalKey(
    Schema.NullishOr(
      Schema.Struct({
        wss_url: Schema.optionalKey(Schema.NullishOr(Schema.String)),
      }),
    ),
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
  code: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  msg: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  success: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  data: Schema.optionalKey(
    Schema.NullishOr(
      Schema.Struct({
        port: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
        wssUrl: Schema.optionalKey(Schema.NullishOr(Schema.String)),
      }),
    ),
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
  status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  resubmit: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  position: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  port: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  had_done: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  tpi_id: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  code: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  res: Schema.optionalKey(Schema.NullishOr(GameBuildNestedResponse)),
});

/*
Sample: POST /api/tasks/a4pem8lvfqgx/choose_build.json
{
  "answer": [["<blank answer>"], "true", "C"],
  "challenge_id": 965834,
  "subject_id": "",
  "question_id": null,
  "competition_entry_id": null,
  "homework_common_id": "421759"
}
*/
const ChooseBuildPayload = Schema.Struct({
  answer: Schema.Array(ChoiceAnswer),
  challenge_id: Schema.Int,
  subject_id: Schema.String,
  question_id: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  competition_entry_id: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  homework_common_id: StringValue,
}).pipe(HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }));

/*
Sample: POST /api/tasks/a4pem8lvfqgx/choose_build.json
{
  "grade": 160,
  "gold": 0,
  "experience": 0,
  "challenge_chooses_count": 16,
  "choose_correct_num": null,
  "test_sets": ["<ChoiceTestCase>"],
  "prev_game": null,
  "next_game": null,
  "knowledge_recommend": false,
  "had_all_submmit": true
}
*/
const ChooseBuildResponse = Schema.Struct({
  grade: Schema.Number,
  gold: Schema.Int,
  experience: Schema.Int,
  challenge_chooses_count: Schema.Int,
  choose_correct_num: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  test_sets: Schema.Array(ChoiceTestCase),
  prev_game: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  next_game: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  knowledge_recommend: Schema.Boolean,
  had_all_submmit: Schema.Boolean,
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
  grade: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  gold: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  experience: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  position: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  test_sets: Schema.optionalKey(Schema.NullishOr(Schema.Array(TaskTestSet))),
  last_compile_output: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  sec_key: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  test_sets_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  sets_error_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
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
        homework_common_id: StringValue,
        zzud: StringValue,
      },
      success: TaskInfoResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("repContent", "/api/tasks/:taskId/rep_content.json", {
      params: TaskRequestParams,
      query: {
        path: StringValue,
        homework_common_id: StringValue,
        exercise_id: Schema.String,
        zzud: StringValue,
      },
      success: RepositoryContentResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("logOutput", "/api/tasks/:taskId/log_output", {
      params: TaskRequestParams,
      query: {
        zzud: StringValue,
      },
      payload: LogOutputPayload,
      success: LogOutputResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("gameBuild", "/api/tasks/:taskId/game_build.json", {
      params: TaskRequestParams,
      query: {
        zzud: StringValue,
      },
      payload: GameBuildPayload,
      success: GameBuildResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("chooseBuild", "/api/tasks/:taskId/choose_build.json", {
      params: TaskRequestParams,
      query: {
        zzud: StringValue,
      },
      payload: ChooseBuildPayload,
      success: ChooseBuildResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("gameStatus", "/api/tasks/:taskId/game_status.json", {
      params: TaskRequestParams,
      query: {
        resubmit: Schema.String,
        time_out: Schema.Boolean,
        port: Schema.Int,
        sec_key: StringValue,
        challenge_id: Schema.Int,
        subject_id: Schema.String,
        homework_common_id: StringValue,
        zzud: StringValue,
      },
      success: GameStatusResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("commitFiles", "/api/tasks/:taskId/commit_files.json", {
      params: TaskRequestParams,
      query: {
        shixun_environment_id: Schema.Int,
        zzud: StringValue,
      },
      success: SimpleResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("pullFiles", "/api/tasks/:taskId/pull_files.json", {
      params: TaskRequestParams,
      query: {
        shixun_environment_id: Schema.Int,
        zzud: StringValue,
      },
      success: SimpleResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("resetPassedCode", "/api/tasks/:taskId/reset_passed_code.json", {
      params: TaskRequestParams,
      query: {
        path: StringValue,
        zzud: StringValue,
      },
      success: ResetPassedCodeResponse,
    }),
  );
