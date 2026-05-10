import { Context } from "effect";
import type { AppConfigState } from "../config/index.js";

export class AppContext extends Context.Service<
  AppContext,
  {
    readonly url: string;
    readonly profile: string;
    readonly config: AppConfigState;
  }
>()("open-educoder/services/context/index/AppContext") {}
