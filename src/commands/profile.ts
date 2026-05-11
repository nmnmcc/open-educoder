import { Console, Data, Effect, Optic } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";
import { Cookies } from "effect/unstable/http";
import { createCipheriv } from "node:crypto";
import { EducoderApi } from "../services/educoder-api/index.js";
import { AppConfig, AppConfigSchema } from "../services/config/index.js";
import { AppContext } from "../services/context/index.js";
import { inspectOptions } from "../utils/inspect-options.js";

const PasswordKey = "5183666c72eec9e4" as const;
const DefaultProfileName = "default" as const;
const $profile = Optic.id<typeof AppConfigSchema.Type>().key("profile");

class LoginError extends Data.TaggedError("LoginError")<{
  readonly message: string;
}> {}

class LogoutError extends Data.TaggedError("LogoutError")<{
  readonly message: string;
}> {}

class ProfileNotFoundError extends Data.TaggedError("ProfileNotFoundError")<{
  readonly message: string;
}> {}

const List = Command.make(
  "list",
  {
    json: Flag.boolean("json"),
  },
  Effect.fn("profile.list")(function* (input) {
    const ctx = yield* AppContext;
    const profiles = Object.entries(ctx.config.profile)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, profile]) => ({
        name,
        current: name === ctx.profile,
        url: profile.url.href,
      }));

    if (input.json) {
      return yield* Console.log(JSON.stringify(profiles, null, 2));
    }

    if (profiles.length === 0) {
      return yield* Console.log("No profiles found.");
    }

    yield* Console.dir(
      {
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
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("List saved profiles and mark the active one."),
  Command.withExamples([
    { command: "open-educoder profile list", description: "Show profiles as an inspectable table" },
    { command: "open-educoder profile list --json", description: "Print profiles as JSON" },
  ]),
  Command.withAlias("l"),
);

const Add = Command.make(
  "add",
  {
    username: Flag.string("username").pipe(Flag.withAlias("u")),
    password: Flag.string("password").pipe(Flag.withAlias("p")),
    name: Argument.string("name").pipe(Argument.withDefault(DefaultProfileName)),
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
).pipe(
  Command.withDescription("Log in to Educoder and store the returned cookies in a named profile."),
  Command.withExamples([
    {
      command: 'open-educoder profile add --username "$EDUCODER_USERNAME" --password "$EDUCODER_PASSWORD"',
      description: "Add or refresh the default profile",
    },
    {
      command: 'open-educoder profile add --username "$EDUCODER_USERNAME" --password "$EDUCODER_PASSWORD" lab',
      description: "Save credentials under a separate profile name",
    },
  ]),
  Command.withAlias("a"),
);

const Remove = Command.make(
  "remove",
  {
    name: Argument.string("name"),
  },
  Effect.fn("profile.remove")(function* (input) {
    const ctx = yield* AppContext;
    const config = yield* AppConfig;
    const state = ctx.config;
    const $$profile = $profile.optionalKey(input.name);
    const profile = $$profile.get(state);

    if (profile === undefined) {
      return yield* new ProfileNotFoundError({
        message: `Profile "${input.name}" does not exist`,
      });
    }

    const educoder = yield* EducoderApi.make(profile.url).pipe(
      Effect.provideService(AppContext, {
        ...ctx,
        url: profile.url.href,
        profile: input.name,
      }),
    );
    const user = yield* educoder.User.getInfo();
    const response = yield* educoder.Account.logout({
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

    yield* config.write($$profile.replace(undefined, state));
    yield* Console.log(`Profile "${input.name}" removed`);
  }),
).pipe(
  Command.withDescription("Log out of Educoder and remove a saved local profile."),
  Command.withExamples([
    { command: "open-educoder profile remove default", description: "Remove the default profile" },
    { command: "open-educoder profile remove lab", description: "Remove a named profile" },
  ]),
  Command.withAlias("R"),
);

export const Profile = Command.make("profile").pipe(
  Command.withDescription("Manage local Educoder login profiles and session cookies."),
  Command.withExamples([
    { command: "open-educoder profile list", description: "List saved profiles" },
    {
      command: 'open-educoder profile add --username "$EDUCODER_USERNAME" --password "$EDUCODER_PASSWORD" default',
      description: "Log in and save cookies for the default profile",
    },
    { command: "open-educoder profile remove old-profile", description: "Log out and delete a saved profile" },
  ]),
  Command.withAlias("p"),
  Command.withSubcommands([List, Add, Remove]),
);

const encryptPassword = (password: string) => {
  const cipher = createCipheriv("aes-128-cbc", Buffer.from(PasswordKey), Buffer.from(PasswordKey));

  return Buffer.concat([cipher.update(password, "utf8"), cipher.final()]).toString("base64");
};
