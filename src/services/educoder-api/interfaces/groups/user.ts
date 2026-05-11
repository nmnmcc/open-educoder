import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

const NullableString = Schema.NullOr(Schema.String);
const NullableNumber = Schema.NullOr(Schema.Number);

/*
Sample: GET /api/users/get_user_info.json
{
  "id": 109348,
  "course_name": "<course name>",
  "course_identity": 5,
  "course_is_end": false,
  "course_public": 0,
  "first_category_url": "/classrooms/MOAPGNLO/shixun_homework"
}
*/
const UserCourse = Schema.Struct({
  ai_headimg_id: NullableNumber,
  ai_nickname: Schema.String,
  board_id: Schema.Int,
  course_end_date: NullableString,
  course_excellent: Schema.Boolean,
  course_group_id: Schema.Int,
  course_identity: Schema.Int,
  course_is_end: Schema.Boolean,
  course_name: Schema.String,
  course_public: Schema.Int,
  course_role: Schema.Int,
  course_school_id: Schema.Int,
  course_school_name: Schema.String,
  first_category_url: Schema.String,
  have_tiding: Schema.Boolean,
  id: Schema.Int,
  is_open_ai: Schema.Boolean,
  is_openengineering: Schema.Boolean,
  own: Schema.Boolean,
});

/*
Sample: GET /api/users/get_user_info.json
{
  "limit_type": 0,
  "expired_at": null
}
*/
const ResourceLimit = Schema.Struct({
  expired_at: NullableString,
  limit_type: Schema.Int,
});

/*
Sample: GET /api/users/get_user_info.json
{
  "user_name": "<user>",
  "user_school": "<school>",
  "user_type": "<type>"
}
*/
const EcUserInfo = Schema.Struct({
  user_name: Schema.String,
  user_school: Schema.String,
  user_type: Schema.String,
});

/*
Sample: GET /api/users/get_user_info.json
{
  "username": "<user>",
  "real_name": "<user>",
  "login": "pl2kfhv6g",
  "user_id": 2905482,
  "image_url": "avatars/User/2905482?t=1734234539",
  "admin": false,
  "is_teacher": false,
  "course": "<UserCourse>"
}
*/
export const User = Schema.Struct({
  username: Schema.String,
  real_name: Schema.String,
  login: Schema.String.pipe(Schema.check(Schema.isMinLength(1))),
  user_id: Schema.Int,
  account_auth: Schema.optionalKey(Schema.Boolean),
  admin: Schema.optionalKey(Schema.Boolean),
  attendance_signed: Schema.optionalKey(Schema.Boolean),
  authentication: Schema.optionalKey(Schema.Boolean),
  big_model_user_unlimited: Schema.optionalKey(Schema.Boolean),
  business: Schema.optionalKey(Schema.Boolean),
  check_phone_and_mail: Schema.optionalKey(Schema.Boolean),
  cloud_space: Schema.optionalKey(Schema.Number),
  college_identifier: Schema.optionalKey(NullableString),
  course: Schema.optionalKey(UserCourse),
  create_subject: Schema.optionalKey(Schema.Boolean),
  data_sets_filesize: Schema.optionalKey(Schema.Number),
  department_id: Schema.optionalKey(NullableNumber),
  department_name: Schema.optionalKey(Schema.String),
  ec_user_info: Schema.optionalKey(EcUserInfo),
  edu_background: Schema.optionalKey(NullableString),
  edu_entry_year: Schema.optionalKey(NullableNumber),
  email: Schema.optionalKey(NullableString),
  experience: Schema.optionalKey(Schema.Int),
  face_image: Schema.optionalKey(Schema.String),
  gender: Schema.optionalKey(NullableString),
  grade: Schema.optionalKey(Schema.Int),
  has_big_model_permission: Schema.optionalKey(Schema.Boolean),
  has_learn_path: Schema.optionalKey(Schema.Boolean),
  has_skill_permission: Schema.optionalKey(Schema.Boolean),
  identity: Schema.optionalKey(Schema.String),
  identity_url: Schema.optionalKey(NullableString),
  image_url: Schema.optionalKey(Schema.String),
  import_user_size: Schema.optionalKey(Schema.Int),
  is_laboratory_admin: Schema.optionalKey(Schema.Boolean),
  is_mirror_marker: Schema.optionalKey(Schema.Boolean),
  is_paid_version: Schema.optionalKey(Schema.Boolean),
  is_school_manage: Schema.optionalKey(Schema.Boolean),
  is_shixun_marker: Schema.optionalKey(Schema.Boolean),
  is_show_btn: Schema.optionalKey(Schema.Boolean),
  is_show_innovation: Schema.optionalKey(Schema.Boolean),
  is_teacher: Schema.optionalKey(Schema.Boolean),
  laboratory_admin_url: Schema.optionalKey(NullableString),
  main_site: Schema.optionalKey(Schema.Boolean),
  major_id: Schema.optionalKey(NullableNumber),
  major_name: Schema.optionalKey(Schema.String),
  mirror_marker_auth: Schema.optionalKey(Schema.Boolean),
  mirror_marker_status: Schema.optionalKey(Schema.Int),
  new_message: Schema.optionalKey(Schema.Boolean),
  open_user_manage: Schema.optionalKey(Schema.Boolean),
  outsource: Schema.optionalKey(Schema.Boolean),
  phone: Schema.optionalKey(Schema.String),
  professional_certification: Schema.optionalKey(Schema.Boolean),
  profile_completed: Schema.optionalKey(Schema.Boolean),
  resource_limit: Schema.optionalKey(ResourceLimit),
  role: Schema.optionalKey(Schema.Int),
  school_id: Schema.optionalKey(NullableNumber),
  school_name: Schema.optionalKey(Schema.String),
  school_province: Schema.optionalKey(Schema.String),
  student_id: Schema.optionalKey(Schema.String),
  tidding_count: Schema.optionalKey(Schema.Int),
  user_competition_token_url: Schema.optionalKey(NullableString),
  user_identity: Schema.optionalKey(Schema.String),
  user_message: Schema.optionalKey(Schema.String),
  user_phone_binded: Schema.optionalKey(Schema.Boolean),
  user_school: Schema.optionalKey(Schema.String),
  user_school_id: Schema.optionalKey(Schema.Int),
  user_status: Schema.optionalKey(Schema.Int),
  virtual_token: Schema.optionalKey(Schema.String),
  weixin_2c_binded: Schema.optionalKey(Schema.Boolean),
  wx_image_url: Schema.optionalKey(Schema.String),
});

export type User = typeof User.Type;

export const UserGroup = HttpApiGroup.make("User").add(
  HttpApiEndpoint.get("getInfo", "/api/users/get_user_info.json", {
    success: User,
  }),
);
