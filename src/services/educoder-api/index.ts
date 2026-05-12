import { Context, Effect, Layer, Optic, Ref } from "effect";
import { Cookies, HttpClient, HttpClientRequest } from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";

import { AppConfig, type AppConfigState } from "../config/index.js";
import { makeEducoderHeaders } from "./headers.js";
import { Interfaces } from "./interfaces/index.js";

export interface EducoderApiConfig {
  readonly url?: string | URL | undefined;
  readonly profile: string;
  readonly config: AppConfigState;
}

const $profile = Optic.id<AppConfigState>().key("profile");

const replaceProfileCookies = (state: AppConfigState, profile: string, cookies: Cookies.Cookies): AppConfigState => {
  const $$profile = $profile.optionalKey(profile);

  return $$profile.modify((saved) =>
    saved === undefined
      ? saved
      : {
          ...saved,
          cookies,
        },
  )(state);
};

export class EducoderApi extends Context.Service<EducoderApi>()("open-educoder/services/educoder-api/EducoderApi", {
  make: ({ url: baseUrl, profile, config }: EducoderApiConfig) =>
    Effect.gen(function* () {
      const appConfig = yield* AppConfig;
      const httpClient = yield* HttpClient.HttpClient;
      const cookiesRef = yield* Ref.make(config.profile[profile]?.cookies ?? Cookies.empty);
      const refreshStoredCookies = (responseCookies: Cookies.Cookies) =>
        Cookies.isEmpty(responseCookies)
          ? Effect.void
          : Ref.get(cookiesRef).pipe(
              Effect.flatMap((cookies) => appConfig.update((state) => replaceProfileCookies(state, profile, cookies))),
            );
      const educoderHttpClient = httpClient.pipe(
        HttpClient.withCookiesRef(cookiesRef),
        HttpClient.tap((response) => refreshStoredCookies(response.cookies)),
        HttpClient.mapRequestEffect((request) =>
          Ref.get(cookiesRef).pipe(
            Effect.map((cookies) =>
              HttpClientRequest.setHeaders(request, makeEducoderHeaders(request.method, cookies)),
            ),
          ),
        ),
      );

      return yield* HttpApiClient.makeWith(Interfaces, {
        baseUrl,
        httpClient: educoderHttpClient,
      });
    }),
}) {
  public static readonly layer = (config: EducoderApiConfig) => Layer.effect(EducoderApi, EducoderApi.make(config));
}
