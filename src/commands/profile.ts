import { Console, Effect } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";

import { DefaultProfileName, ProfileFeature } from "../services/features/profile.js";
import { inspectOptions } from "../utils/inspect-options.js";

const List = Command.make(
  "list",
  {
    json: Flag.boolean("json"),
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
  Command.withDescription("Show all saved profiles and indicate which profile is active."),
  Command.withExamples([
    { command: "open-educoder profile list", description: "List saved profiles" },
    {
      command: "open-educoder profile list --json",
      description: "Print all profiles in machine-readable format",
    },
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
    const profileFeature = yield* ProfileFeature;
    const result = yield* profileFeature.add({
      username: input.username,
      password: input.password,
      name: input.name,
    });

    yield* Console.log(result.view.message);
  }),
).pipe(
  Command.withDescription("Save a profile by logging in and storing returned cookies locally."),
  Command.withExamples([
    {
      command: 'open-educoder profile add --username "$EDUCODER_USERNAME" --password "$EDUCODER_PASSWORD"',
      description: "Create or refresh the default profile",
    },
    {
      command: 'open-educoder profile add --username "$EDUCODER_USERNAME" --password "$EDUCODER_PASSWORD" lab',
      description: "Save another login under a custom profile name",
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
    const profileFeature = yield* ProfileFeature;
    const result = yield* profileFeature.remove({ name: input.name });

    yield* Console.log(result.view.message);
  }),
).pipe(
  Command.withDescription("Delete a saved profile and clear its stored login session."),
  Command.withExamples([
    { command: "open-educoder profile remove default", description: "Delete the default profile" },
    { command: "open-educoder profile remove lab", description: "Delete a named profile" },
  ]),
  Command.withAlias("R"),
);

export const Profile = Command.make("profile").pipe(
  Command.withDescription("Manage Educoder login profiles stored on this machine."),
  Command.withExamples([
    { command: "open-educoder profile list", description: "List saved profiles" },
    {
      command: 'open-educoder profile add --username "$EDUCODER_USERNAME" --password "$EDUCODER_PASSWORD" default',
      description: "Log in and save cookies for the default profile",
    },
    { command: "open-educoder profile remove old-profile", description: "Delete a saved profile" },
  ]),
  Command.withAlias("p"),
  Command.withSubcommands([List, Add, Remove]),
);
