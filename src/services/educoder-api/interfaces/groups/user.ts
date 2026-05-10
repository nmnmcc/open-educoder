import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

export const User = HttpApiGroup.make("User").add(
  HttpApiEndpoint.get("getInfo", "/api/users/get_user_info.json", {
    success: Schema.Struct({
      username: Schema.String,
      real_name: Schema.String,
      login: Schema.String.pipe(Schema.check(Schema.isMinLength(1))),
      user_id: Schema.Int,
    }),
  }),
);
