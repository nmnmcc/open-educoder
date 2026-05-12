import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

/*
Sample: GET /api/users/get_user_info.json
{
  "username": "<user>",
  "real_name": "<user>",
  "login": "pl2kfhv6g",
  "user_id": 2905482
}
*/
export const User = Schema.Struct({
  username: Schema.String,
  real_name: Schema.String,
  login: Schema.String,
  user_id: Schema.Int,
});

export type User = typeof User.Type;

export const UserGroup = HttpApiGroup.make("User").add(
  HttpApiEndpoint.get("getInfo", "/api/users/get_user_info.json", {
    success: User,
  }),
);
