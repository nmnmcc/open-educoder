import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

export const Account = HttpApiGroup.make("Account")
  .add(
    HttpApiEndpoint.post("login", "/api/accounts/login.json", {
      /*
      Sample unavailable: no captured /api/accounts/login.json payload.
      */
      payload: Schema.Struct({
        login: Schema.String,
        password: Schema.String,
      }),
    }),
  )
  .add(
    HttpApiEndpoint.get("logout", "/api/accounts/logout.json", {
      query: {
        zzud: Schema.String,
      },
    }),
  );
