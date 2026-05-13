#!/usr/bin/env node
import { homedir } from "node:os";
import path from "node:path";

import { NodeSdk } from "@effect/opentelemetry";
import { NodeHttpClient, NodeRuntime, NodeServices } from "@effect/platform-node";
import { BatchSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
import { Effect, Layer, Option, identity } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { ProxyAgent } from "proxy-agent";

import meta from "../package.json" with { type: "json" };
import { Accounts } from "./commands/accounts.js";
import { Assignments } from "./commands/assignments/index.js";
import { Courses } from "./commands/courses.js";
import { Exams } from "./commands/exams.js";
import { Tui } from "./commands/tui.js";
import { AppConfig } from "./services/config/index.js";
import { AppContext } from "./services/context/index.js";
import { EducoderApi } from "./services/educoder-api/index.js";
import { FeatureLayer } from "./services/features/index.js";

const DefaultEducoderUrl = "https://data.educoder.net" as const;

const OpenEducoder = Command.make("open-educoder").pipe(
  Command.withDescription("Run authenticated Educoder workflows from a local CLI."),
  Command.withAlias("o"),
  Command.withSharedFlags({
    url: Flag.string("url").pipe(
      Flag.withDescription("Educoder base URL to call. Defaults to the selected account URL, then data.educoder.net."),
      Flag.optional,
    ),
    account: Flag.string("account").pipe(
      Flag.withDescription('Choose the saved user for this command, e.g. --account lab. Defaults to "default".'),
      Flag.withDefault("default"),
    ),
    config: Flag.path("config").pipe(
      Flag.withDescription("Path to the local open-educoder config directory."),
      Flag.withDefault(path.join(homedir(), ".config", meta.name)),
    ),
    otel: Flag.boolean("otel").pipe(
      Flag.withDescription("Print OpenTelemetry spans to the console."),
      Flag.withDefault(false),
    ),
  }),
  Command.withSubcommands([Accounts, Courses, Assignments, Exams, Tui]),
  Command.provide(({ url, account, config, otel }) =>
    Layer.unwrap(
      Effect.gen(function* () {
        const config = yield* AppConfig.use(({ read }) => read);
        const resolvedUrl = Option.match(url, {
          onNone: () => config.account[account]?.url.href ?? DefaultEducoderUrl,
          onSome: identity,
        });

        const educoder = yield* EducoderApi.make({ url: resolvedUrl, account, config });
        const user = yield* Effect.cached(educoder.User.getInfo());

        return FeatureLayer.pipe(
          Layer.provideMerge(
            Layer.mergeAll(
              Layer.succeed(EducoderApi, educoder),
              Layer.succeed(AppContext, { url: resolvedUrl, account, config, user }),
            ),
          ),
        );
      }),
    ).pipe(
      Layer.provideMerge(AppConfig.layer(config)),
      otel
        ? Layer.provideMerge(
            NodeSdk.layer(() => ({
              spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
            })),
          )
        : identity,
    ),
  ),
);

const program = Command.run(OpenEducoder, { version: meta.version });

const NodeLayer = Layer.mergeAll(
  NodeServices.layer,
  NodeHttpClient.layerNodeHttpNoAgent.pipe(
    Layer.provideMerge(Layer.effect(NodeHttpClient.HttpAgent, NodeHttpClient.makeAgent(new ProxyAgent()))),
  ),
);

program.pipe(Effect.withSpan("open-educoder"), Effect.provide(NodeLayer), NodeRuntime.runMain);
