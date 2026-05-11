import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const NonEmptyString = Schema.String.pipe(Schema.check(Schema.isMinLength(1)));
const EmptyArray = Schema.Array(Schema.Never);
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
  id: Schema.Int,
  identifier: Schema.String,
  myshixun_id: Schema.Int,
  challenge_id: Schema.Int,
  user_id: Schema.Int,
  status: Schema.Int,
  final_score: Schema.Number,
  cost_time: Schema.Number,
  created_at: Schema.String,
  updated_at: Schema.String,
  open_time: Schema.String,
  end_time: NullableString,
  star: Schema.Int,
  answer_open: Schema.Int,
  answer_deduction: Schema.Number,
  evaluate_count: Schema.Int,
  exericse_evaluate_count: Schema.Int,
  accuracy: NullableNumber,
  code_change_count: NullableNumber,
  extend_score: NullableNumber,
  modify_time: NullableString,
  picture_path: NullableString,
  resubmit_identifier: NullableString,
  retry_status: Schema.Int,
  score_radio: Schema.Number,
  target_query_index: NullableNumber,
  test_sets_view: Schema.Boolean,
  homework_common_answer_open: Schema.Boolean,
  homework_common_comment_open: Schema.Boolean,
  exercise_finished_at: NullableString,
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
  id: Schema.Int,
  position: Schema.Int,
  subject: Schema.String,
  score: Schema.Number,
  path: Schema.String,
  difficulty: Schema.Int,
  exec_time: Schema.Int,
  shixun_id: Schema.Int,
  st: Schema.Int,
  task_pass: Schema.String,
  praises_count: Schema.Int,
  disable_copy: Schema.Boolean,
  hide_answer: Schema.Boolean,
  homework_challenge_index: Schema.Int,
  ignore_space: Schema.Int,
  modify_time: NullableString,
  open_rank: Schema.String,
  show_type: Schema.Int,
  thiry_party: Schema.Boolean,
  web_route: NullableString,
  with_code_file: Schema.Boolean,
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
  id: Schema.Int,
  identifier: Schema.String,
  name: Schema.String,
  language: Schema.String,
  status: Schema.Int,
  repo_name: Schema.String,
  git_url: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  modify_time: Schema.String,
  publish_time: Schema.String,
  reset_time: Schema.String,
  mark_content: Schema.String,
  evaluate_method: Schema.String,
  standard_answer: Schema.String,
  number: Schema.String,
  name_pinyin: Schema.String,
  user_id: Schema.Int,
  challenges_count: Schema.Int,
  users_count: Schema.Int,
  myshixuns_count: Schema.Int,
  visits: Schema.Int,
  averge_star: Schema.Number,
  exec_time: Schema.Int,
  open_answer_and_test: Schema.Int,
  public: Schema.Int,
  trainee: Schema.Int,
  use_scope: Schema.Int,
  webssh: Schema.Int,
  sticky: Schema.Int,
  fork_from: Schema.Int,
  split_from: Schema.Int,
  original_shixun_id: Schema.Int,
  laboratory_id: Schema.Int,
  mirror_script_id: Schema.Int,
  evaluate_scirpt_env_id: Schema.Int,
  initiative_study_num: Schema.Int,
  spoc_study_num: Schema.Int,
  pod_life: Schema.Int,
  survival_time: Schema.Int,
  prebuild_click_count: Schema.Int,
  mark_status: Schema.Int,
  hide_code: Schema.Int,
  active_copy: Schema.Boolean,
  allow_file_upload: Schema.Boolean,
  authentication: Schema.Boolean,
  can_copy: Schema.Boolean,
  close_internet: Schema.Boolean,
  code_edit_permission: Schema.Boolean,
  copy_for_exercise: Schema.Boolean,
  copy_for_exercise_save: Schema.Boolean,
  display_git_address: Schema.Boolean,
  exit_delete_pod_switch: Schema.Boolean,
  forbid_copy: Schema.Boolean,
  hidden: Schema.Boolean,
  homepage_show: Schema.Boolean,
  is_commit_file_rule: Schema.Boolean,
  is_disable_discuss: Schema.Boolean,
  is_important_shixun: Schema.Boolean,
  is_jupyter: Schema.Boolean,
  is_jupyter_lab: Schema.Boolean,
  is_jupyter_lab_private_cloud: Schema.Boolean,
  is_wechat_support: Schema.Boolean,
  jupyter_evaluate: Schema.Boolean,
  jupyter_show_description: Schema.Boolean,
  multi_webssh: Schema.Boolean,
  need_authorize: Schema.Boolean,
  open_code_debugger: Schema.Boolean,
  open_local_evaluate: Schema.Boolean,
  open_self_run: Schema.Boolean,
  outsourced: Schema.Boolean,
  port_mapping: Schema.Boolean,
  show_code_dir: Schema.Boolean,
  sigle_training: Schema.Boolean,
  sync_git_remote_code: Schema.Boolean,
  task_pass: Schema.Boolean,
  test_set_permission: Schema.Boolean,
  to_be_built: Schema.Boolean,
  use_jupyter_result: Schema.Boolean,
  vip: Schema.Boolean,
  closer_id: NullableNumber,
  delete_user_id: NullableNumber,
  end_time: NullableString,
  excute_time: NullableString,
  gpid: NullableNumber,
  image_text: NullableString,
  jupyter_lab_appoint_directory: NullableString,
  jupyter_lab_appoint_file_type: NullableString,
  jupyter_lab_custom_file_type: NullableString,
  jupyter_lab_private_cloud_id: NullableNumber,
  jupyter_lab_private_instance_id: NullableNumber,
  major_id: NullableNumber,
  mark_time: NullableString,
  mark_user_id: NullableNumber,
  opening_time: NullableString,
  public_datetime: NullableString,
  public_user_id: NullableNumber,
  publish_datetime: NullableString,
  publish_user_id: NullableNumber,
  startup_file: NullableString,
  version_identifier: NullableString,
  webssh_cloud_type: NullableNumber,
  windows_connection_mode: NullableString,
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
  id: Schema.Int,
  identifier: Schema.String,
  commit_id: Schema.String,
  status: Schema.Int,
  repo_name: Schema.String,
  shixun_id: Schema.Int,
  user_id: Schema.Int,
  created_at: Schema.String,
  updated_at: Schema.String,
  modify_time: Schema.String,
  onclick_time: Schema.String,
  reset_time: Schema.String,
  hidden: Schema.Boolean,
  is_public: Schema.Boolean,
  system_tip: Schema.Boolean,
  git_url: NullableString,
  gpid: NullableNumber,
  reset_repository_user_id: NullableNumber,
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
  user_id: Schema.Int,
  login: Schema.String,
  name: Schema.String,
  school: Schema.String,
  image_url: Schema.String,
  user_url: Schema.String,
  authentication: Schema.Boolean,
  disable_discuss_status: Schema.Int,
  grade: Schema.Int,
  identity: Schema.Int,
  user_course_identity: Schema.Int,
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
  shixun_environment_id: Schema.Int,
  name: Schema.String,
  tab_type: Schema.Int,
  resource_type: Schema.Int,
  tpi_type: Schema.Int,
  cloud_type: Schema.Int,
  program_language: Schema.String,
  index_tab: Schema.String,
  allow_use_code_debugger: Schema.Boolean,
  command_settings: EmptyArray,
  command_string: EmptyArray,
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
  id: NullableNumber,
  input: Schema.String,
  output: Schema.String,
  actual_output: NullableString,
  result: NullableBoolean,
  is_public: Schema.Boolean,
  matchRule: Schema.String,
  compile_success: NullableNumber,
  ts_mem: NullableNumber,
  ts_time: NullableNumber,
  actual_output_visible: Schema.Boolean,
  input_file_url: NullableString,
  input_visible: Schema.Boolean,
  is_file: Schema.Boolean,
  is_invisible: Schema.Boolean,
  output_file_url: NullableString,
  show_lock: Schema.Boolean,
  tags: NullableString,
  type: Schema.Int,
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{
  "ai_exam_question": false,
  "ai_syntax_check": false,
  "ai_code_diagnosis": false,
  "ai_code_evaluation_promote": "<text>"
}
*/
const HomeworkExtension = Schema.Struct({
  ai_exam_question: Schema.Boolean,
  ai_syntax_check: Schema.Boolean,
  ai_code_diagnosis: Schema.Boolean,
  ai_guidance: Schema.Boolean,
  ai_guide: Schema.Boolean,
  ai_q_and_a: Schema.Boolean,
  ai_code_evaluation_promote: Schema.String,
  ai_code_evaluation: Schema.Boolean,
  ai_code_optimization: Schema.Boolean,
  ai_code_comment: Schema.Boolean,
});

/*
Sample: GET /api/tasks/sflmr2fxi4wn.json
{
  "name": "<environment>",
  "description": "<description>",
  "shixun_environment_id": 1128633,
  "close_internet": false
}
*/
const MirrorDescription = Schema.Struct({
  name: Schema.String,
  description: Schema.String,
  shixun_environment_id: Schema.Int,
  close_internet: Schema.Boolean,
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
  st: Schema.Int,
  discusses_count: Schema.Int,
  game_count: Schema.Int,
  record_consume_time: NullableNumber,
  prev_game: NullableString,
  next_game: NullableString,
  praise_count: Schema.Int,
  user_praise: Schema.Boolean,
  time_limit: Schema.Int,
  tomcat_url: Schema.String,
  is_teacher: Schema.Boolean,
  myshixun_manager: Schema.Boolean,
  game: TaskGame,
  challenge: TaskChallenge,
  shixun: TaskShixun,
  myshixun: TaskMyshixun,
  user: TaskUser,
  rank_name: NullableString,
  is_last_game: Schema.Boolean,
  shixun_choice_public_result: Schema.Boolean,
  status: Schema.String,
  homework_common_id: Schema.Int,
  homework_common_name: Schema.String,
  homework_common_is_end: Schema.Boolean,
  homework_extension: HomeworkExtension,
  shixun_environments: Schema.Array(ShixunEnvironment),
  test_sets: Schema.Array(TaskTestSet),
  test_sets_count: NullableNumber,
  sets_error_count: NullableNumber,
  shixun_status: Schema.Int,
  local_evaluate_languages: Schema.Array(Schema.String),
  mirror_description: Schema.Array(Schema.String),
  mirror_description_multi: Schema.Array(MirrorDescription),
  mirror_name: Schema.Array(Schema.String),
  last_compile_output: NullableString,
  sec_key: NullableString,
  wss_url: Schema.String,
  subject_id: NullableNumber,
  subject_name: NullableString,
  to_user_id: Schema.Int,
  user_course_identity: Schema.Int,
  code_editor: MirrorDescription,
  testCasesExp: NullableString,
  testCasesType: Schema.Int,
  picture: Schema.Int,
  show_style: Schema.Int,
  open_answer_and_test: Schema.Int,
  open_local_evaluate: Schema.Boolean,
  open_self_run: Schema.Boolean,
  openai_tpi: Schema.Boolean,
  hideLeftPanel: Schema.Boolean,
  hide_width_rate: Schema.Number,
  action_analysis: Schema.Boolean,
  allowed_unlock: Schema.Boolean,
  challenge_optional: Schema.Boolean,
  chatgpt: Schema.Boolean,
  exit_delete_pod_switch: Schema.Boolean,
  has_answer: Schema.Boolean,
  in_review: Schema.Boolean,
  is_charge_window: Schema.Boolean,
  is_open_submit_test_result: Schema.Boolean,
  is_sub_pass: Schema.Boolean,
  is_submit_test_result: Schema.Boolean,
  manager_permission: Schema.Boolean,
  related_poll: Schema.Boolean,
  show_start_permanent: Schema.Boolean,
  skip_level: Schema.Boolean,
  start_permanent: Schema.Boolean,
  tpm_cases_modified: Schema.Boolean,
  tpm_modified: Schema.Boolean,
  view_answer_tip: Schema.Boolean,
  work_end_forbid_evaluate: Schema.Boolean,
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
  status: Schema.Int,
  message: Schema.String,
  data: Schema.Struct({
    wss_url: Schema.String,
  }),
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
  status: Schema.Int,
  resubmit: NullableString,
  position: Schema.Int,
  port: Schema.Int,
  had_done: Schema.Int,
  tpi_id: Schema.String,
  code: NullableString,
  res: Schema.Struct({
    code: Schema.Int,
    msg: Schema.String,
    success: Schema.Boolean,
    data: Schema.Struct({
      ableToCreate: Schema.Int,
      code: Schema.Int,
      costTime: Schema.Int,
      msg: Schema.String,
      port: Schema.Int,
      queueCode: Schema.Int,
      waitNum: Schema.Int,
      wssUrl: Schema.String,
    }),
  }),
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
  grade: Schema.Number,
  gold: Schema.Int,
  experience: Schema.Int,
  status: Schema.Int,
  had_done: Schema.Int,
  position: Schema.Int,
  port: Schema.String,
  record_consume_time: Schema.Number,
  mirror_name: Schema.Array(Schema.String),
  picture: Schema.Int,
  web_route: NullableString,
  star: Schema.Int,
  next_game: Schema.String,
  prev_game: NullableString,
  proxy_port: Schema.Int,
  test_sets: Schema.Array(TaskTestSet),
  allowed_unlock: Schema.Boolean,
  last_compile_output: Schema.String,
  sec_key: Schema.String,
  test_sets_count: Schema.Int,
  sets_error_count: Schema.Int,
  answer_open: Schema.Int,
  game_original_status: Schema.Int,
  game_report_id: NullableNumber,
  knowledge_recommend: Schema.Boolean,
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
