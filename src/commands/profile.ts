import { Console, Data, Effect, Optic } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";
import { Cookies } from "effect/unstable/http";
import { createCipheriv } from "node:crypto";
import { EducoderApi } from "../services/educoder-api/index.js";
import { AppConfig, AppConfigSchema } from "../services/config/index.js";
import { AppContext } from "../services/context/index.js";

const passwordKey = "5183666c72eec9e4" as const;
const $profile = Optic.id<typeof AppConfigSchema.Type>().key("profile");

class LoginError extends Data.TaggedError("LoginError")<{
  readonly message: string;
}> {}

class ProfileNotFoundError extends Data.TaggedError("ProfileNotFoundError")<{
  readonly message: string;
}> {}

export const profile = Command.make("profile").pipe(
  Command.withAlias("auth"),
  Command.withSubcommands([
    Command.make(
      "add",
      {
        username: Flag.string("username").pipe(Flag.withAlias("u")),
        password: Flag.string("password").pipe(Flag.withAlias("p")),
        name: Argument.string("name").pipe(Argument.withDefault("default")),
      },
      Effect.fn("profile.add")(function* (input) {
        const ctx = yield* AppContext;
        const educoder = yield* EducoderApi;
        const config = yield* AppConfig;
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

        const state = ctx.config;
        const $$profile = $profile.optionalKey(input.name);
        const url = new URL(ctx.url);

        yield* config.write(
          $$profile.modify((profile) => ({
            cookies: Cookies.merge(profile?.cookies ?? Cookies.empty, response.cookies),
            url,
          }))(state),
        );

        yield* Console.log(`Profile "${input.name}" added`);
      }),
    ),
    Command.make(
      "remove",
      {
        name: Argument.string("name"),
      },
      Effect.fn("profile.remove")(function* (input) {
        const ctx = yield* AppContext;
        const config = yield* AppConfig;
        const state = ctx.config;
        const $$profile = $profile.optionalKey(input.name);

        if ($$profile.get(state) === undefined) {
          return yield* new ProfileNotFoundError({
            message: `Profile "${input.name}" does not exist`,
          });
        }

        yield* config.write($$profile.replace(undefined, state));
        yield* Console.log(`Profile "${input.name}" removed`);
      }),
    ),
  ]),
);

const encryptPassword = (password: string) => {
  const cipher = createCipheriv("aes-128-cbc", Buffer.from(passwordKey), Buffer.from(passwordKey));

  return Buffer.concat([cipher.update(password, "utf8"), cipher.final()]).toString("base64");
};
