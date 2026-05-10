import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

export const Account = HttpApiGroup.make("Account").add(
  HttpApiEndpoint.post("login", "/api/accounts/login.json", {
    payload: Schema.Struct({
      login: Schema.String.pipe(Schema.check(Schema.isMinLength(1))),
      password: Schema.String.pipe(Schema.check(Schema.isMinLength(1))),
    }),
  }),
);
