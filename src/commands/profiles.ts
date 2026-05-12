import { Console, Effect } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";

import { DefaultProfileName, ProfileFeature } from "../services/features/profile.js";
import { inspectOptions } from "../utils/inspect-options.js";

const List = Command.make(
  "list",
  {
    json: Flag.boolean("json").pipe(Flag.withDescription("Print saved profiles as JSON.")),
  },
  Effect.fn("profile.list")(function* (input) {
    const profileFeature = yield* ProfileFeature;
    const result = yield* profileFeature.list();

    if (input.json) {
      return yield* Console.log(JSON.stringify(result.raw, null, 2));
    }

    if (result.raw.length === 0) {
      return yield* Console.log("No profiles found.");
    }

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("List saved login profiles and mark the active profile."),
  Command.withExamples([
    { command: "open-educoder profiles list", description: "List saved profiles" },
    {
      command: "open-educoder profiles list --json",
      description: "Print all profiles in machine-readable format",
    },
  ]),
  Command.withAlias("l"),
);

const Add = Command.make(
  "add",
  {
    username: Flag.string("username").pipe(
      Flag.withDescription("Educoder username or login account."),
      Flag.withAlias("u"),
    ),
    password: Flag.string("password").pipe(
      Flag.withDescription("Educoder password for the account."),
      Flag.withAlias("p"),
    ),
    name: Argument.string("name").pipe(
      Argument.withDescription("Local profile name to save."),
      Argument.withDefault(DefaultProfileName),
    ),
  },
  Effect.fn("profile.add")(function* (input) {
    const profileFeature = yield* ProfileFeature;
    const result = yield* profileFeature.add({
      username: input.username,
      password: input.password,
      name: input.name,
    });

    yield* Console.log(result.view.message);
  }),
).pipe(
  Command.withDescription("Log in and save the returned session as a local profile."),
  Command.withExamples([
    {
      command: 'open-educoder profiles add --username "$EDUCODER_USERNAME" --password "$EDUCODER_PASSWORD"',
      description: "Create or refresh the default profile",
    },
    {
      command: 'open-educoder profiles add --username "$EDUCODER_USERNAME" --password "$EDUCODER_PASSWORD" lab',
      description: "Save another login under a custom profile name",
    },
  ]),
  Command.withAlias("a"),
);

const Remove = Command.make(
  "remove",
  {
    name: Argument.string("name").pipe(Argument.withDescription("Saved profile name to remove.")),
  },
  Effect.fn("profile.remove")(function* (input) {
    const profileFeature = yield* ProfileFeature;
    const result = yield* profileFeature.remove({ name: input.name });

    yield* Console.log(result.view.message);
  }),
).pipe(
  Command.withDescription("Remove a saved profile and its stored session cookies."),
  Command.withExamples([
    { command: "open-educoder profiles remove default", description: "Delete the default profile" },
    { command: "open-educoder profiles remove lab", description: "Delete a named profile" },
  ]),
  Command.withAlias("R"),
);

export const Profiles = Command.make("profiles").pipe(
  Command.withDescription("Add, list, and remove local Educoder login profiles."),
  Command.withExamples([
    { command: "open-educoder profiles list", description: "List saved profiles" },
    {
      command: 'open-educoder profiles add --username "$EDUCODER_USERNAME" --password "$EDUCODER_PASSWORD" default',
      description: "Log in and save cookies for the default profile",
    },
    { command: "open-educoder profiles remove old-profile", description: "Delete a saved profile" },
  ]),
  Command.withAlias("p"),
  Command.withSubcommands([List, Add, Remove]),
);
