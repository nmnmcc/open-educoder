import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

export const Account = HttpApiGroup.make("Account")
  .add(
    HttpApiEndpoint.post("login", "/api/accounts/login.json", {
      /*
      Sample: POST /api/accounts/login.json
      {
        "login": "<username>",
        "password": "<encrypted password>",
        "autologin": true
      }
      */
      payload: Schema.Struct({
        login: Schema.String,
        password: Schema.String,
        autologin: Schema.optionalKey(Schema.Boolean),
      }),
    }),
  )
  .add(
    HttpApiEndpoint.get("logout", "/api/accounts/logout.json", {
      /*
      Sample: GET /api/accounts/logout.json
      {
        "zzud": "<login>"
      }
      */
      query: {
        zzud: Schema.String,
      },
    }),
  );
