#!/usr/bin/env node
import { homedir } from "node:os";
import path from "node:path";

import { NodeSdk } from "@effect/opentelemetry";
import { NodeHttpClient, NodeRuntime, NodeServices } from "@effect/platform-node";
import { BatchSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
import { Effect, Layer, identity } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { ProxyAgent } from "proxy-agent";

import meta from "../package.json" with { type: "json" };
import { Course } from "./commands/course.js";
import { Exam } from "./commands/exam.js";
import { Homework } from "./commands/homework/index.js";
import { Profile } from "./commands/profile.js";
import { Tui } from "./commands/tui.js";
import { AppConfig } from "./services/config/index.js";
import { AppContext } from "./services/context/index.js";
import { EducoderApi } from "./services/educoder-api/index.js";
import { FeatureLayer } from "./services/features/index.js";

const OpenEducoder = Command.make("open-educoder").pipe(
  Command.withDescription("Open Educoder as a fast local CLI."),
  Command.withSharedFlags({
    url: Flag.string("url").pipe(Flag.withDefault("https://data.educoder.net")),
    profile: Flag.string("profile").pipe(Flag.withDefault("default")),
    config: Flag.path("config").pipe(Flag.withDefault(path.join(homedir(), ".config", meta.name))),
    otel: Flag.boolean("otel").pipe(Flag.withDefault(false)),
  }),
  Command.withSubcommands([Profile, Course, Homework, Exam, Tui]),
  Command.provide(({ url, profile, config, otel }) =>
    Layer.unwrap(
      Effect.gen(function* () {
        const config = yield* AppConfig.use(({ read }) => read);

        const educoder = yield* EducoderApi.make({ url, profile, config });
        const user = yield* Effect.cached(educoder.User.getInfo());

        return FeatureLayer.pipe(
          Layer.provideMerge(
            Layer.mergeAll(
              Layer.succeed(EducoderApi, educoder),
              Layer.succeed(AppContext, { url, profile, config, user }),
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
