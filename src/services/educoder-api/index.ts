import { Cause, Context, Data, Effect, Layer, Optic, Ref, Schema } from "effect";
import { Cookies, HttpClient, HttpClientRequest, type HttpClientResponse } from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";

import { AppConfig, type AppConfigState } from "../config/index.js";
import { makeEducoderHeaders } from "./headers.js";
import { Interfaces } from "./interfaces/index.js";

export interface EducoderApiConfig {
  readonly url?: string | URL | undefined;
  readonly account: string;
  readonly config: AppConfigState;
}

export interface EducoderApiRawResponse {
  readonly request: {
    readonly method: string;
    readonly url: string;
  };
  readonly status: number;
  readonly headers: Readonly<Record<string, string | undefined>>;
  readonly body: string;
}

export class EducoderApiSchemaError extends Data.TaggedError("EducoderApiSchemaError")<{
  readonly message: string;
  readonly cause: Schema.SchemaError;
  readonly rawResponse: EducoderApiRawResponse;
}> {}

const $account = Optic.id<AppConfigState>().key("account");
const LastEducoderResponse = Context.Reference<HttpClientResponse.HttpClientResponse | undefined>(
  "open-educoder/services/educoder-api/LastEducoderResponse",
  { defaultValue: () => undefined },
);

const replaceAccountCookies = (state: AppConfigState, account: string, cookies: Cookies.Cookies): AppConfigState => {
  const $$account = $account.optionalKey(account);

  return $$account.modify((saved) =>
    saved === undefined
      ? saved
      : {
          ...saved,
          cookies,
        },
  )(state);
};

const setLastEducoderResponse = (response: HttpClientResponse.HttpClientResponse): Effect.Effect<void> =>
  Effect.withFiber((fiber) =>
    Effect.sync(() => {
      fiber.setContext(Context.add(fiber.context, LastEducoderResponse, response));
    }),
  );

const findSchemaError = (cause: Cause.Cause<unknown>): Schema.SchemaError | undefined => {
  for (const reason of cause.reasons) {
    if (Cause.isFailReason(reason) && Schema.isSchemaError(reason.error)) {
      return reason.error;
    }
  }

  return undefined;
};

const makeRawResponse = (response: HttpClientResponse.HttpClientResponse, body: string): EducoderApiRawResponse => ({
  request: {
    method: response.request.method,
    url: response.request.url,
  },
  status: response.status,
  headers: response.headers,
  body,
});

const makeSchemaErrorMessage = (rawResponse: EducoderApiRawResponse, schemaError: Schema.SchemaError) =>
  [
    "Educoder API response failed schema decoding.",
    `${rawResponse.request.method} ${rawResponse.request.url}`,
    `Status: ${rawResponse.status}`,
    "Response:",
    rawResponse.body,
    "SchemaError:",
    schemaError.message,
  ].join("\n");

const transformSchemaError = (effect: Effect.Effect<unknown, unknown, unknown>) =>
  Effect.catchCause(effect, (cause) => {
    const schemaError = findSchemaError(cause);

    if (schemaError === undefined) {
      return Effect.failCause(cause);
    }

    return LastEducoderResponse.use((response) =>
      response === undefined
        ? Effect.failCause(cause)
        : response.text.pipe(
            Effect.flatMap((body) => {
              const rawResponse = makeRawResponse(response, body);

              return Effect.fail(
                new EducoderApiSchemaError({
                  message: makeSchemaErrorMessage(rawResponse, schemaError),
                  cause: schemaError,
                  rawResponse,
                }),
              );
            }),
          ),
    );
  });

export class EducoderApi extends Context.Service<EducoderApi>()("open-educoder/services/educoder-api/EducoderApi", {
  make: ({ url: baseUrl, account, config }: EducoderApiConfig) =>
    Effect.gen(function* () {
      const appConfig = yield* AppConfig;
      const httpClient = yield* HttpClient.HttpClient;
      const cookiesRef = yield* Ref.make(config.account[account]?.cookies ?? Cookies.empty);
      const refreshStoredCookies = (responseCookies: Cookies.Cookies) =>
        Cookies.isEmpty(responseCookies)
          ? Effect.void
          : Ref.get(cookiesRef).pipe(
              Effect.flatMap((cookies) => appConfig.update((state) => replaceAccountCookies(state, account, cookies))),
            );
      const educoderHttpClient = httpClient.pipe(
        HttpClient.withCookiesRef(cookiesRef),
        HttpClient.tap((response) =>
          Effect.gen(function* () {
            yield* setLastEducoderResponse(response);
            yield* refreshStoredCookies(response.cookies);
          }),
        ),
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
        transformResponse: transformSchemaError,
      });
    }),
}) {
  public static readonly layer = (config: EducoderApiConfig) => Layer.effect(EducoderApi, EducoderApi.make(config));
}
