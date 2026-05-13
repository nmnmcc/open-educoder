import { createCipheriv } from "node:crypto";

import { Context, Data, Effect, Layer, Optic } from "effect";
import { Cookies, HttpClient } from "effect/unstable/http";

import { AppConfig, AppConfigSchema } from "../config/index.js";
import { AppContext } from "../context/index.js";
import { EducoderApi } from "../educoder-api/index.js";
import { type FeatureWorkflow, type FeatureWorkflowWithoutInput } from "./shared.js";

const PasswordKey = "5183666c72eec9e4" as const;
export const DefaultAccountName = "default" as const;
const $account = Optic.id<typeof AppConfigSchema.Type>().key("account");

export class LoginError extends Data.TaggedError("LoginError")<{
  readonly message: string;
}> {}

export class LogoutError extends Data.TaggedError("LogoutError")<{
  readonly message: string;
}> {}

export class AccountNotFoundError extends Data.TaggedError("AccountNotFoundError")<{
  readonly message: string;
}> {}

export const encryptPassword = (password: string) => {
  const cipher = createCipheriv("aes-128-cbc", Buffer.from(PasswordKey), Buffer.from(PasswordKey));

  return Buffer.concat([cipher.update(password, "utf8"), cipher.final()]).toString("base64");
};

type AddAccountInput = {
  readonly username: string;
  readonly password: string;
  readonly name: string;
};

type RemoveAccountInput = {
  readonly name: string;
};

type AccountListItem = {
  readonly name: string;
  readonly current: boolean;
  readonly url: string;
};

type ListAccountsView = {
  readonly current: string;
  readonly accounts: Record<
    string,
    {
      readonly current: boolean;
      readonly url: string;
    }
  >;
};

type AccountMutationRaw = {
  readonly status: number;
};

type AccountMutationView = {
  readonly message: string;
};

export type AccountFeatureShape = {
  readonly list: FeatureWorkflowWithoutInput<ReadonlyArray<AccountListItem>, ListAccountsView>;
  readonly add: FeatureWorkflow<AddAccountInput, AccountMutationRaw, AccountMutationView>;
  readonly remove: FeatureWorkflow<RemoveAccountInput, AccountMutationRaw, AccountMutationView>;
};

export class AccountFeature extends Context.Service<AccountFeature, AccountFeatureShape>()(
  "open-educoder/services/features/AccountFeature",
) {
  public static readonly layer = Layer.effect(
    AccountFeature,
    Effect.gen(function* () {
      const ctx = yield* AppContext;
      const educoder = yield* EducoderApi;
      const config = yield* AppConfig;
      const httpClient = yield* HttpClient.HttpClient;

      const list: AccountFeatureShape["list"] = Effect.fn("features.account.list")(function* () {
        const accounts = Object.entries(ctx.config.account)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name, account]) => ({
            name,
            current: name === ctx.account,
            url: account.url.href,
          }));

        return {
          raw: accounts,
          view: {
            current: ctx.account,
            accounts: Object.fromEntries(
              accounts.map((account) => [
                account.name,
                {
                  current: account.current,
                  url: account.url,
                },
              ]),
            ),
          },
        };
      });

      const add: AccountFeatureShape["add"] = Effect.fn("features.account.add")(function* (input) {
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

        const $$account = $account.optionalKey(input.name);
        const url = new URL(ctx.url);

        yield* config.update((state) =>
          $$account.modify((account) => ({
            cookies: Cookies.merge(account?.cookies ?? Cookies.empty, response.cookies),
            url,
          }))(state),
        );

        return {
          raw: {
            status: response.status,
          },
          view: {
            message: `Account "${input.name}" added`,
          },
        };
      });

      const remove: AccountFeatureShape["remove"] = Effect.fn("features.account.remove")(function* (input) {
        const state = yield* config.read;
        const $$account = $account.optionalKey(input.name);
        const account = $$account.get(state);

        if (account === undefined) {
          return yield* new AccountNotFoundError({
            message: `Account "${input.name}" does not exist`,
          });
        }

        const accountEducoder = yield* EducoderApi.make({
          url: account.url,
          account: input.name,
          config: state,
        }).pipe(Effect.provideService(AppConfig, config), Effect.provideService(HttpClient.HttpClient, httpClient));
        const user = yield* accountEducoder.User.getInfo();
        const response = yield* accountEducoder.Account.logout({
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

        yield* config.update((state) => $$account.replace(undefined, state));

        return {
          raw: {
            status: response.status,
          },
          view: {
            message: `Account "${input.name}" removed`,
          },
        };
      });

      return AccountFeature.of({
        list,
        add,
        remove,
      });
    }),
  );
}
