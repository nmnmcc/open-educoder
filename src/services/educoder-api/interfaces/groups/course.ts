import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

export const Course = HttpApiGroup.make("Course").add(
  HttpApiEndpoint.get("list", "/api/users/:username/courses.json", {
    params: {
      username: Schema.String.pipe(Schema.check(Schema.isMinLength(1))),
    },
    query: {
      // ?category=&status=processing&page=1&per_page=15&sort_by=updated_at&sort_direction=desc&username=pl2kfhv6g&zzud=pl2kfhv6g
      category: Schema.NullishOr(Schema.String),
      status: Schema.NullishOr(Schema.Literals(["processing", "end"])), // omitted = all
      page: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
      per_page: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
      sort_by: Schema.Literals(["updated_at", "created_at", "name"]),
      sort_direction: Schema.Literals(["desc", "asc"]),
      username: Schema.String.pipe(Schema.check(Schema.isMinLength(1))),
      zzud: Schema.String.pipe(Schema.check(Schema.isMinLength(1))),
    },
    success:
      /*
{
    "count": 1,
    "courses": [
        {
            "id": 109348,
            "name": "操作系统2026",
            "members_count": 1143,
            "homework_commons_count": 55,
            "attachments_count": 16,
            "visits": 40207,
            "school": "珠海科技学院",
            "teacher_users": [
                "..."
            ],
            "created_at": "2026-02-27 09:23:37",
            "is_end": false,
            "subject_id": null,
            "subject_identifier": null,
            "first_category_url": "/classrooms/MOAPGNLO/announcement",
            "first_category": {
                "module_type": "announcement",
                "id": 1809402
            },
            "is_public": 0,
            "can_visited": true,
            "teacher": {
                "id": 2137897,
                "real_name": "...",
                "avatar_url": "avatars/User/2137897?t=1736177014",
                "school_name": "珠海科技学院"
            },
            "forbid_visit_info": {
                "forbid_student_visit": false,
                "username": ""
            }
        }
    ]
}
      */
      Schema.Struct({
        count: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(0))),
        courses: Schema.Array(
          Schema.Struct({
            id: Schema.Int,
            name: Schema.String,
            members_count: Schema.Int,
            homework_commons_count: Schema.Int,
            attachments_count: Schema.Int,
            visits: Schema.Int,
            school: Schema.String,
            teacher_users: Schema.Array(Schema.String),
            created_at: Schema.String,
            is_end: Schema.Boolean,
            subject_id: Schema.NullishOr(Schema.String),
            subject_identifier: Schema.NullishOr(Schema.String),
            first_category_url: Schema.String,
            first_category: Schema.Struct({
              module_type: Schema.String,
              id: Schema.Int,
            }),
            is_public: Schema.BooleanFromBit,
            can_visited: Schema.Boolean,
            teacher: Schema.Struct({
              id: Schema.Int,
              real_name: Schema.String,
              avatar_url: Schema.String,
              school_name: Schema.String,
            }),
            forbid_visit_info: Schema.Struct({
              forbid_student_visit: Schema.Boolean,
              username: Schema.String,
            }),
          }),
        ),
      }),
  }),
);
