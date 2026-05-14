import { Console, Effect } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";

import { AccountFeature, DefaultAccountName } from "../services/features/account.js";
import { record, renderFields, renderListedCount, renderTable } from "./shared/output.js";

const renderAccounts = (view: unknown) => {
  const root = record(view);
  const accounts = Object.entries(record(root["accounts"])).map(([name, accountValue]) => ({
    name,
    account: record(accountValue),
  }));

  return [
    "ACCOUNTS",
    renderFields([["Current", root["current"]]]),
    "",
    renderTable(accounts, [
      { header: "ACCOUNT", value: (row) => row.name },
      { header: "CURRENT", value: (row) => row.account["current"] },
      { header: "URL", value: (row) => row.account["url"] },
    ]),
    "",
    renderListedCount(accounts.length, "account"),
  ].join("\n");
};

const List = Command.make(
  "list",
  {
    json: Flag.boolean("json").pipe(Flag.withDescription("Print saved accounts as JSON.")),
  },
  Effect.fn("account.list")(function* (input) {
    const accountFeature = yield* AccountFeature;
    const result = yield* accountFeature.list();

    if (input.json) {
      return yield* Console.log(JSON.stringify(result.raw, null, 2));
    }

    if (result.raw.length === 0) {
      return yield* Console.log("No accounts found.");
    }

    yield* Console.log(renderAccounts(result.view));
  }),
).pipe(
  Command.withDescription("List saved Educoder accounts and mark the active account."),
  Command.withExamples([
    { command: "open-educoder accounts list", description: "List saved accounts" },
    {
      command: "open-educoder accounts list --json",
      description: "Print all accounts in machine-readable format",
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
      Argument.withDescription("Local account name to save."),
      Argument.withDefault(DefaultAccountName),
    ),
  },
  Effect.fn("account.add")(function* (input) {
    const accountFeature = yield* AccountFeature;
    const result = yield* accountFeature.add({
      username: input.username,
      password: input.password,
      name: input.name,
    });

    yield* Console.log(result.view.message);
  }),
).pipe(
  Command.withDescription("Log in and save the returned session as a local account."),
  Command.withExamples([
    {
      command: 'open-educoder accounts add --username "$EDUCODER_USERNAME" --password "$EDUCODER_PASSWORD"',
      description: "Create or refresh the default account",
    },
    {
      command: 'open-educoder accounts add --username "$EDUCODER_USERNAME" --password "$EDUCODER_PASSWORD" lab',
      description: "Save another login under a custom account name",
    },
  ]),
  Command.withAlias("a"),
);

const Remove = Command.make(
  "remove",
  {
    name: Argument.string("name").pipe(Argument.withDescription("Saved account name to remove.")),
  },
  Effect.fn("account.remove")(function* (input) {
    const accountFeature = yield* AccountFeature;
    const result = yield* accountFeature.remove({ name: input.name });

    yield* Console.log(result.view.message);
  }),
).pipe(
  Command.withDescription("Remove a saved account and its stored session cookies."),
  Command.withExamples([
    { command: "open-educoder accounts remove default", description: "Delete the default account" },
    { command: "open-educoder accounts remove lab", description: "Delete a named account" },
  ]),
  Command.withAlias("R"),
);

export const Accounts = Command.make("accounts").pipe(
  Command.withDescription("Add, list, and remove local Educoder accounts."),
  Command.withExamples([
    { command: "open-educoder accounts list", description: "List saved accounts" },
    {
      command: 'open-educoder accounts add --username "$EDUCODER_USERNAME" --password "$EDUCODER_PASSWORD" default',
      description: "Log in and save cookies for the default account",
    },
    { command: "open-educoder accounts remove old-account", description: "Delete a saved account" },
  ]),
  Command.withAlias("u"),
  Command.withSubcommands([List, Add, Remove]),
);
