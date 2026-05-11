import { Context } from "effect";
import type { Effect, Schema } from "effect";
import type { HttpClientError } from "effect/unstable/http";
import type { AppConfigState } from "../config/index.js";
import type { User } from "../educoder-api/interfaces/groups/user.js";

export class AppContext extends Context.Service<
  AppContext,
  {
    readonly url: string;
    readonly profile: string;
    readonly config: AppConfigState;
    readonly user: Effect.Effect<User, HttpClientError.HttpClientError | Schema.SchemaError>;
  }
>()("open-educoder/services/context/index/AppContext") {}
