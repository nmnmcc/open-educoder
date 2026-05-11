#!/usr/bin/env node
import meta from "../package.json" with { type: "json" };
import { NodeHttpClient, NodeRuntime, NodeServices } from "@effect/platform-node";
import { Context, Effect, Layer } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { ProxyAgent } from "proxy-agent";
import { EducoderApi } from "./services/educoder-api/index.js";
import { homedir } from "node:os";
import path from "node:path";
import { Course } from "./commands/course.js";
import { Exam } from "./commands/exam.js";
import { Homework } from "./commands/homework/index.js";
import { Profile } from "./commands/profile.js";
import { AppConfig } from "./services/config/index.js";
import { AppContext } from "./services/context/index.js";

const OpenEducoder = Command.make("open-educoder").pipe(
  Command.withDescription("Local CLI for authenticated Educoder workflows."),
  Command.withExamples([
    { command: "open-educoder profile list", description: "List saved login profiles" },
    {
      command: "open-educoder course info MOAPGNLO",
      description: "Inspect a course by course ID",
    },
    {
      command: "open-educoder homework shixun list MOAPGNLO --category 1213302",
      description: "List shixun homeworks in a course category",
    },
    {
      command: "open-educoder exam show MOAPGNLO 198085 --with-choice-content",
      description: "Show questions for an exam",
    },
  ]),
  Command.withSharedFlags({
    url: Flag.string("url").pipe(Flag.withDefault("https://data.educoder.net")),
    profile: Flag.string("profile").pipe(Flag.withDefault("default")),
    config: Flag.path("config").pipe(Flag.withDefault(path.join(homedir(), ".config", meta.name))),
  }),
  Command.withSubcommands([Profile, Course, Homework, Exam]),
  Command.provide(({ url, profile, config }) =>
    Layer.effectContext(
      AppConfig.use((appConfig) =>
        Effect.gen(function* () {
          const state = yield* appConfig.read;
          const educoder = yield* EducoderApi.make({ url, profile, config: state });
          const user = yield* Effect.cached(educoder.User.getInfo());

          return Context.make(EducoderApi, educoder).pipe(
            Context.add(AppContext, {
              url,
              profile,
              config: state,
              user,
            }),
          );
        }),
      ),
    ).pipe(Layer.provideMerge(AppConfig.layer(config))),
  ),
);

const layer = Layer.mergeAll(
  NodeServices.layer,
  NodeHttpClient.layerNodeHttpNoAgent.pipe(
    Layer.provideMerge(Layer.effect(NodeHttpClient.HttpAgent, NodeHttpClient.makeAgent(new ProxyAgent()))),
  ),
);

const program = Effect.gen(function* () {
  return yield* Command.run(OpenEducoder, { version: meta.version }).pipe(Effect.provide(layer));
});

NodeRuntime.runMain(program);
