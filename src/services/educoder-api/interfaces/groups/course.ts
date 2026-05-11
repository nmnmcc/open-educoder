import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

export const Course = HttpApiGroup.make("Course").add(
  HttpApiEndpoint.get("list", "/api/users/:username/courses.json", {
    params: {
      username: Schema.String.pipe(Schema.check(Schema.isMinLength(1))),
    },
    query: {
      category: Schema.NullishOr(Schema.String),
      status: Schema.NullishOr(Schema.Literals(["processing", "end"])), // omitted = all
      page: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
      per_page: Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(1))),
      sort_by: Schema.Literals(["updated_at", "created_at", "name"]),
      sort_direction: Schema.Literals(["desc", "asc"]),
      username: Schema.String.pipe(Schema.check(Schema.isMinLength(1))),
      zzud: Schema.String.pipe(Schema.check(Schema.isMinLength(1))),
    },
    success: Schema.Struct({
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
