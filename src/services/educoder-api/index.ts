import { Context, Effect, Layer, Ref } from "effect";
import { Cookies, HttpClient, HttpClientRequest } from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";
import { AppContext } from "../context/index.js";
import { makeEducoderHeaders } from "./headers.js";
import { Interfaces } from "./interfaces/index.js";

export class EducoderApi extends Context.Service<EducoderApi>()("open-educoder/services/educoder-api/EducoderApi", {
  make: (baseUrl?: string | URL | undefined) =>
    Effect.gen(function* () {
      const ctx = yield* AppContext;
      const httpClient = yield* HttpClient.HttpClient;
      const state = ctx.config;
      const cookiesRef = yield* Ref.make(state.profile[ctx.profile]?.cookies ?? Cookies.empty);
      const educoderHttpClient = httpClient.pipe(
        HttpClient.mapRequest((request) => HttpClientRequest.setHeaders(request, makeEducoderHeaders(request.method))),
        HttpClient.withCookiesRef(cookiesRef),
      );

      return yield* HttpApiClient.makeWith(Interfaces, {
        baseUrl,
        httpClient: educoderHttpClient,
      });
    }),
}) {
  public static readonly layer = (baseUrl?: string | URL | undefined) =>
    Layer.effect(EducoderApi, EducoderApi.make(baseUrl));
}
