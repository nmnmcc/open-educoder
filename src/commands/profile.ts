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
    const profileFeature = yield* ProfileFeature;
    const result = yield* profileFeature.add({
      username: input.username,
      password: input.password,
      name: input.name,
    });

    yield* Console.log(result.view.message);
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
    const profileFeature = yield* ProfileFeature;
    const result = yield* profileFeature.remove({ name: input.name });

    yield* Console.log(result.view.message);
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
