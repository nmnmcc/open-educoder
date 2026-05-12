import { createCipheriv } from "node:crypto";

import { Context, Data, Effect, Layer, Optic } from "effect";
import { Cookies, HttpClient } from "effect/unstable/http";

import { AppConfig, AppConfigSchema } from "../config/index.js";
import { AppContext } from "../context/index.js";
import { EducoderApi } from "../educoder-api/index.js";
import { type FeatureWorkflow, type FeatureWorkflowWithoutInput } from "./shared.js";

const PasswordKey = "5183666c72eec9e4" as const;
export const DefaultProfileName = "default" as const;
const $profile = Optic.id<typeof AppConfigSchema.Type>().key("profile");

export class LoginError extends Data.TaggedError("LoginError")<{
  readonly message: string;
}> {}

export class LogoutError extends Data.TaggedError("LogoutError")<{
  readonly message: string;
}> {}

export class ProfileNotFoundError extends Data.TaggedError("ProfileNotFoundError")<{
  readonly message: string;
}> {}

export const encryptPassword = (password: string) => {
  const cipher = createCipheriv("aes-128-cbc", Buffer.from(PasswordKey), Buffer.from(PasswordKey));

  return Buffer.concat([cipher.update(password, "utf8"), cipher.final()]).toString("base64");
};

type AddProfileInput = {
  readonly username: string;
  readonly password: string;
  readonly name: string;
};

type RemoveProfileInput = {
  readonly name: string;
};

type ProfileListItem = {
  readonly name: string;
  readonly current: boolean;
  readonly url: string;
};

type ListProfilesView = {
  readonly current: string;
  readonly profiles: Record<
    string,
    {
      readonly current: boolean;
      readonly url: string;
    }
  >;
};

type ProfileMutationRaw = {
  readonly status: number;
};

type ProfileMutationView = {
  readonly message: string;
};

export type ProfileFeatureShape = {
  readonly list: FeatureWorkflowWithoutInput<ReadonlyArray<ProfileListItem>, ListProfilesView>;
  readonly add: FeatureWorkflow<AddProfileInput, ProfileMutationRaw, ProfileMutationView>;
  readonly remove: FeatureWorkflow<RemoveProfileInput, ProfileMutationRaw, ProfileMutationView>;
};

export class ProfileFeature extends Context.Service<ProfileFeature, ProfileFeatureShape>()(
  "open-educoder/services/features/ProfileFeature",
) {
  public static readonly layer = Layer.effect(
    ProfileFeature,
    Effect.gen(function* () {
      const ctx = yield* AppContext;
      const educoder = yield* EducoderApi;
      const config = yield* AppConfig;
      const httpClient = yield* HttpClient.HttpClient;

      const list: ProfileFeatureShape["list"] = Effect.fn("features.profile.list")(function* () {
        const profiles = Object.entries(ctx.config.profile)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name, profile]) => ({
            name,
            current: name === ctx.profile,
            url: profile.url.href,
          }));

        return {
          raw: profiles,
          view: {
            current: ctx.profile,
            profiles: Object.fromEntries(
              profiles.map((profile) => [
                profile.name,
                {
                  current: profile.current,
                  url: profile.url,
                },
              ]),
            ),
          },
        };
      });

      const add: ProfileFeatureShape["add"] = Effect.fn("features.profile.add")(function* (input) {
        const response = yield* educoder.Account.login({
          payload: {
            login: input.username,
            password: encryptPassword(input.password),
          },
          responseMode: "response-only",
        });

        if (response.status < 200 || response.status >= 300) {
          return yield* new LoginError({
            message: `Login failed with status ${response.status}`,
          });
        }

        const $$profile = $profile.optionalKey(input.name);
        const url = new URL(ctx.url);

        yield* config.update((state) =>
          $$profile.modify((profile) => ({
            cookies: Cookies.merge(profile?.cookies ?? Cookies.empty, response.cookies),
            url,
          }))(state),
        );

        return {
          raw: {
            status: response.status,
          },
          view: {
            message: `Profile "${input.name}" added`,
          },
        };
      });

      const remove: ProfileFeatureShape["remove"] = Effect.fn("features.profile.remove")(function* (input) {
        const state = yield* config.read;
        const $$profile = $profile.optionalKey(input.name);
        const profile = $$profile.get(state);

        if (profile === undefined) {
          return yield* new ProfileNotFoundError({
            message: `Profile "${input.name}" does not exist`,
          });
        }

        const profileEducoder = yield* EducoderApi.make({
          url: profile.url,
          profile: input.name,
          config: state,
        }).pipe(Effect.provideService(AppConfig, config), Effect.provideService(HttpClient.HttpClient, httpClient));
        const user = yield* profileEducoder.User.getInfo();
        const response = yield* profileEducoder.Account.logout({
          query: {
            zzud: user.login,
          },
          responseMode: "response-only",
        });

        if (response.status < 200 || response.status >= 300) {
          return yield* new LogoutError({
            message: `Logout failed with status ${response.status}`,
          });
        }

        yield* config.update((state) => $$profile.replace(undefined, state));

        return {
          raw: {
            status: response.status,
          },
          view: {
            message: `Profile "${input.name}" removed`,
          },
        };
      });

      return ProfileFeature.of({
        list,
        add,
        remove,
      });
    }),
  );
}
