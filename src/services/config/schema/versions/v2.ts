import { Schema } from "effect";
import { Cookies } from "effect/unstable/http";

import { defineVersion } from "../version.js";
import { v1 } from "./v1.js";

export const Account = Schema.Struct({
  url: Schema.URLFromString,
  cookies: Cookies.CookiesSchema,
});

export const v2 = defineVersion({
  from: v1,
  schema: Schema.Struct({
    account: Schema.Record(Schema.String.pipe(Schema.check(Schema.isMinLength(1))), Account),
  }),
  migrate: (previous) => ({
    account: previous.profile,
  }),
});
