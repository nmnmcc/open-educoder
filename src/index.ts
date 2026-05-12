#!/usr/bin/env node
import meta from "../package.json" with { type: "json" };
import { NodeHttpClient, NodeRuntime, NodeServices } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { Course } from "./commands/course.js";
import { Exam } from "./commands/exam.js";
import { Homework } from "./commands/homework/index.js";
import { Profile } from "./commands/profile.js";
import { AppConfig } from "./services/config/index.js";
import { EducoderApi } from "./services/educoder-api/index.js";
import { AppContext } from "./services/context/index.js";
import path from "node:path";
import { homedir } from "node:os";
import { ProxyAgent } from "proxy-agent";
import { FeatureLayer } from "./services/features/index.js";
import { Tui } from "./commands/tui.js";

const OpenEducoder = Command.make("open-educoder").pipe(
  Command.withDescription("Local CLI for authenticated Educoder workflows."),
  Command.withExamples([
    {
      command: "open-educoder profile list",
      description: "List saved login profiles",
    },
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
  Command.withSubcommands([Profile, Course, Homework, Exam, Tui]),
  Command.provide(({ url, profile, config }) =>
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
    ).pipe(Layer.provideMerge(AppConfig.layer(config))),
  ),
);

const program = Command.run(OpenEducoder, { version: meta.version });

const NodeLayer = Layer.mergeAll(
  NodeServices.layer,
  NodeHttpClient.layerNodeHttpNoAgent.pipe(
    Layer.provideMerge(Layer.effect(NodeHttpClient.HttpAgent, NodeHttpClient.makeAgent(new ProxyAgent()))),
  ),
);

program.pipe(Effect.provide(NodeLayer), NodeRuntime.runMain);
