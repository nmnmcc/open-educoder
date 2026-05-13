import { Schema } from "effect";
import { Cookies } from "effect/unstable/http";

import { defineVersion } from "../version.js";

export const Account = Schema.Struct({
  url: Schema.URLFromString,
  cookies: Cookies.CookiesSchema,
});

export const v1 = defineVersion({
  schema: Schema.Struct({
    account: Schema.Record(Schema.String.pipe(Schema.check(Schema.isMinLength(1))), Account),
  }),
  init: {
    account: {},
  },
});
