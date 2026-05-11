#!/usr/bin/env node
import meta from "../package.json" with { type: "json" };
import { NodeHttpClient, NodeRuntime, NodeServices } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { ProxyAgent } from "proxy-agent";
import { EducoderApi } from "./services/educoder-api/index.js";
import { homedir } from "node:os";
import path from "node:path";
import { course } from "./commands/course.js";
import { exam } from "./commands/exam.js";
import { profile } from "./commands/profile.js";
import { AppConfig } from "./services/config/index.js";
import { AppContext } from "./services/context/index.js";

const app = Command.make("open-educoder").pipe(
  Command.withSharedFlags({
    url: Flag.string("url").pipe(Flag.withDefault("https://data.educoder.net")),
    profile: Flag.string("profile").pipe(Flag.withDefault("default")),
    config: Flag.path("config").pipe(Flag.withDefault(path.join(homedir(), ".config", meta.name))),
  }),
  Command.withSubcommands([profile, course, exam]),
  Command.provide(({ url, profile, config }) =>
    EducoderApi.layer(url).pipe(
      Layer.provideMerge(
        Layer.effect(
          AppContext,
          AppConfig.use((config) =>
            config.read.pipe(
              Effect.map((state) => ({
                url,
                profile,
                config: state,
              })),
            ),
          ),
        ).pipe(Layer.provideMerge(AppConfig.layer(config))),
      ),
    ),
  ),
);

const layer = Layer.mergeAll(
  NodeServices.layer,
  NodeHttpClient.layerNodeHttpNoAgent.pipe(
    Layer.provideMerge(Layer.effect(NodeHttpClient.HttpAgent, NodeHttpClient.makeAgent(new ProxyAgent()))),
  ),
);

const program = Effect.gen(function* () {
  return yield* Command.run(app, { version: meta.version }).pipe(Effect.provide(layer));
});

NodeRuntime.runMain(program);
