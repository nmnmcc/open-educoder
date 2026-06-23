import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const StringValue = Schema.String;

const PracticeIdentifierParams = {
  identifier: StringValue,
};

/*
Sample: GET /api/practices.json?page=1&per_page=30&search=&filter=public&zzud=<login>
{
  "identifier": "efjwgtb8",
  "name": "<problem name>",
  "difficulty": 1,
  "position": 2,
  "updated_at": "2024-12-09 18:43:22",
  "user_count": 124650,
  "solution_count": 112,
  "status": 1,
  "practice_status": 1,
  "tag_disciplines_name": ["<tag>"],
  "pass_ratio": "46%",
  "has_video_solution": null,
  "is_self": false,
  "creator": "<creator>"
}
*/
const PracticeListItem = Schema.Struct({
  identifier: StringValue,
  name: StringValue,
  difficulty: Schema.Int,
  position: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  updated_at: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  user_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  solution_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  practice_status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  tag_disciplines_name: Schema.optionalKey(Schema.NullishOr(Schema.Array(Schema.String))),
  pass_ratio: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  has_video_solution: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  is_self: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  creator: Schema.optionalKey(Schema.NullishOr(Schema.String)),
});

/*
Sample: GET /api/practices.json?page=1&per_page=30&search=&filter=public&zzud=<login>
{
  "practices_count": 2983,
  "practices_list": ["<PracticeListItem>"]
}
*/
const PracticeListResponse = Schema.Struct({
  practices_count: Schema.Int,
  practices_list: Schema.Array(PracticeListItem),
});

/*
Sample: GET /api/tag_disciplines.json?target=practice&position=index&zzud=<login>
{
  "id": 2821,
  "name": "<tag>",
  "count": 1056
}
*/
const TagDiscipline = Schema.Struct({
  id: Schema.Int,
  name: StringValue,
  count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
});

/*
Sample: GET /api/tag_disciplines.json?target=practice&position=index&zzud=<login>
{
  "tag_disciplines": ["<TagDiscipline>"]
}
*/
const TagDisciplinesResponse = Schema.Struct({
  tag_disciplines: Schema.Array(TagDiscipline),
});

/*
Sample: GET /api/practices/efjwgtb8/start?zzud=<login>
{
  "status": 0,
  "message": "success",
  "identifier": "<mypractice identifier>"
}
*/
const StartResponse = Schema.Struct({
  status: Schema.Int,
  message: StringValue,
  identifier: StringValue,
});

/*
Sample: GET /api/mypractices/<identifier>.json?hidePopLogin=true&zzud=<login>
{
  "language": "C",
  "modify": false
}
*/
const ModifyCodeLanguage = Schema.Struct({
  language: StringValue,
  modify: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
});

/*
Sample: GET /api/mypractices/<identifier>.json?hidePopLogin=true&zzud=<login>
{
  "id": 1625,
  "name": "<problem name>",
  "difficulty": 1,
  "time_limit": 3,
  "description": "<markdown statement>",
  "score": null,
  "identifier": "efjwgtb8",
  "status": 1,
  "praises_count": 0,
  "language": "C",
  "username": "<author>",
  "user_path": "/users/p79526408",
  "code": "<base64 last saved code>",
  "pass_count": 57612,
  "submit_count": 487777,
  "notes": null,
  "modify_code": ["<ModifyCodeLanguage>"],
  "passed": false,
  "comments_count": 113,
  "user_praise": false,
  "edit_privilege": false,
  "test_case_size": 5
}
*/
const PracticeDetail = Schema.Struct({
  id: Schema.Int,
  name: StringValue,
  difficulty: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  time_limit: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  description: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  score: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  identifier: StringValue,
  status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  praises_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  language: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  username: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  user_path: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  code: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  pass_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  submit_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  notes: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  modify_code: Schema.optionalKey(Schema.NullishOr(Schema.Array(ModifyCodeLanguage))),
  passed: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  comments_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  user_praise: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  edit_privilege: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  test_case_size: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
});

/*
Sample: GET /api/mypractices/<identifier>.json?hidePopLogin=true&zzud=<login>
{
  "input": "3 1",
  "is_file": false
}
*/
const PracticeTestCase = Schema.Struct({
  input: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  is_file: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
});

/*
Sample: GET /api/mypractices/<identifier>.json?hidePopLogin=true&zzud=<login>
{
  "user_id": 3443410,
  "login": "<login>",
  "name": "<name>",
  "grade": 300,
  "identity": "student",
  "image_url": "avatars/User/b",
  "school": "<school>",
  "user_url": "/users/<login>",
  "practice_manager": false,
  "admin": false
}
*/
const PracticeUser = Schema.Struct({
  user_id: Schema.Int,
  login: StringValue,
  name: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  grade: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  identity: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  image_url: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  school: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  user_url: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  practice_manager: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  admin: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
});

/*
Sample: GET /api/mypractices/<identifier>.json?hidePopLogin=true&zzud=<login>
{
  "practice": "<PracticeDetail>",
  "test_case": "<PracticeTestCase>",
  "user": "<PracticeUser>"
}
*/
const DetailResponse = Schema.Struct({
  practice: PracticeDetail,
  test_case: Schema.optionalKey(Schema.NullishOr(PracticeTestCase)),
  user: Schema.optionalKey(Schema.NullishOr(PracticeUser)),
});

/*
Sample: POST /api/mypractices/<identifier>/initial_codes.json
{
  "language": "C",
  "code": "<base64 starter code>"
}
*/
const InitialCode = Schema.Struct({
  language: StringValue,
  code: StringValue,
});

/*
Sample: POST /api/mypractices/<identifier>/initial_codes.json
{
  "status": 0,
  "message": "success",
  "data": ["<InitialCode>"]
}
*/
const InitialCodesResponse = Schema.Struct({
  status: Schema.Int,
  message: StringValue,
  data: Schema.optionalKey(Schema.NullishOr(Schema.Array(InitialCode))),
});

/*
Sample: POST /api/mypractices/<identifier>/update_code.json?zzud=<login>
{
  "code": "<base64 source code>",
  "language": "C++"
}
*/
const UpdateCodePayload = Schema.Struct({
  code: StringValue,
  language: StringValue,
}).pipe(HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }));

/*
Sample: POST /api/mypractices/<identifier>/code_debug.json?zzud=<login>
{
  "input": "3 1"
}
*/
const CodeDebugPayload = Schema.Struct({
  input: Schema.optionalKey(Schema.NullishOr(Schema.String)),
}).pipe(HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }));

/*
Sample: POST /api/mypractices/<identifier>/code_submit.json?zzud=<login>
{}
*/
const CodeSubmitPayload = Schema.Struct({}).pipe(
  HttpApiSchema.asJson({ contentType: "application/json; charset=utf-8" }),
);

/*
Sample: POST /api/mypractices/<identifier>/update_code.json (and code_debug/code_submit)
{
  "status": 0,
  "message": "success"
}
*/
const SimpleResponse = Schema.Struct({
  status: Schema.Int,
  message: StringValue,
});

/*
Sample: GET /api/mypractices/<identifier>/result.json?mode=submit&zzud=<login>
{
  "id": 5303585,
  "status": 0,
  "error_line": null,
  "error_msg": "NA",
  "input": "3 1",
  "output": "NA",
  "execute_time": 0.088,
  "execute_memory": 3.25,
  "passed": true,
  "input_file_url": "3 1",
  "output_file_url": "NA",
  "is_file": false,
  "expected_output": "NA",
  "expected_output_file_url": "NA",
  "time_better_than": 0,
  "memory_better_than": 0
}
*/
const ResultData = Schema.Struct({
  id: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  error_line: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  error_msg: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  input: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  output: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  execute_time: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  execute_memory: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  passed: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  input_file_url: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  output_file_url: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  is_file: Schema.optionalKey(Schema.NullishOr(Schema.Boolean)),
  expected_output: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  expected_output_file_url: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  time_better_than: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  memory_better_than: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
});

/*
Sample: GET /api/mypractices/<identifier>/result.json?mode=debug&zzud=<login>
While evaluating:
{
  "status": 1,
  "message": "正在评测中"
}
After completion:
{
  "status": 0,
  "message": "评测完成",
  "data": "<ResultData>"
}
*/
const ResultResponse = Schema.Struct({
  status: Schema.Int,
  message: StringValue,
  data: Schema.optionalKey(Schema.NullishOr(ResultData)),
});

/*
Sample: GET /api/mypractices/<identifier>/submit_records.json?limit=15&page=1&zzud=<login>
{
  "id": 5303585,
  "created_at": "2026-06-22T23:32:58.000+08:00",
  "status": 0,
  "execute_time": 0.088,
  "execute_memory": 3.25,
  "language": "C++"
}
*/
const SubmitRecord = Schema.Struct({
  id: Schema.Int,
  created_at: Schema.optionalKey(Schema.NullishOr(Schema.String)),
  status: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
  execute_time: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  execute_memory: Schema.optionalKey(Schema.NullishOr(Schema.Number)),
  language: Schema.optionalKey(Schema.NullishOr(Schema.String)),
});

/*
Sample: GET /api/mypractices/<identifier>/submit_records.json?limit=15&page=1&zzud=<login>
{
  "records": ["<SubmitRecord>"],
  "records_count": 1
}
*/
const SubmitRecordsResponse = Schema.Struct({
  records: Schema.Array(SubmitRecord),
  records_count: Schema.optionalKey(Schema.NullishOr(Schema.Int)),
});

export const Practice = HttpApiGroup.make("Practice")
  .add(
    HttpApiEndpoint.get("list", "/api/practices.json", {
      query: {
        page: Schema.Int,
        per_page: Schema.Int,
        search: StringValue,
        save_search: StringValue,
        filter: StringValue,
        // Sample: GET /api/practices.json?source_discipline_id[]=2906&source_discipline_id[]=2945
        // Repeated array param; each selected source becomes one source_discipline_id[]=<id> pair.
        "source_discipline_id[]": Schema.optionalKey(Schema.Array(StringValue)),
        zzud: StringValue,
      },
      success: PracticeListResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("disciplines", "/api/tag_disciplines.json", {
      query: {
        target: StringValue,
        position: StringValue,
        zzud: StringValue,
      },
      success: TagDisciplinesResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("start", "/api/practices/:identifier/start", {
      params: PracticeIdentifierParams,
      query: {
        zzud: StringValue,
      },
      success: StartResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("detail", "/api/mypractices/:identifier.json", {
      params: PracticeIdentifierParams,
      query: {
        hidePopLogin: StringValue,
        zzud: StringValue,
      },
      success: DetailResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("initialCodes", "/api/mypractices/:identifier/initial_codes.json", {
      params: PracticeIdentifierParams,
      query: {
        zzud: StringValue,
      },
      success: InitialCodesResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("updateCode", "/api/mypractices/:identifier/update_code.json", {
      params: PracticeIdentifierParams,
      query: {
        zzud: StringValue,
      },
      payload: UpdateCodePayload,
      success: SimpleResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("codeDebug", "/api/mypractices/:identifier/code_debug.json", {
      params: PracticeIdentifierParams,
      query: {
        zzud: StringValue,
      },
      payload: CodeDebugPayload,
      success: SimpleResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("codeSubmit", "/api/mypractices/:identifier/code_submit.json", {
      params: PracticeIdentifierParams,
      query: {
        zzud: StringValue,
      },
      payload: CodeSubmitPayload,
      success: SimpleResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("result", "/api/mypractices/:identifier/result.json", {
      params: PracticeIdentifierParams,
      query: {
        mode: StringValue,
        zzud: StringValue,
      },
      success: ResultResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("submitRecords", "/api/mypractices/:identifier/submit_records.json", {
      params: PracticeIdentifierParams,
      query: {
        limit: Schema.Int,
        page: Schema.Int,
        zzud: StringValue,
      },
      success: SubmitRecordsResponse,
    }),
  );
