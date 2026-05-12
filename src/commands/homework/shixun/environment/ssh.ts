import { Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import {
  ChallengeId,
  ChallengeIndex,
  CourseId,
  EnvironmentId,
  HomeworkIdArgument,
  TerminalTabType,
} from "../../flags.js";
import { optionToUndefined, printJson } from "../../shared.js";

const runSsh = Effect.fn("homework.shixun.ssh.runSsh")(function* (args: ReadonlyArray<string>) {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const exitCode = yield* spawner.exitCode(
    ChildProcess.make("ssh", args, {
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
      detached: false,
    }),
  );

  yield* Effect.sync(() => {
    if (exitCode !== 0) {
      process.exitCode = Number(exitCode);
    }
  });
});

export const Ssh = Command.make(
  "ssh",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    envId: EnvironmentId,
    tabType: TerminalTabType,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.ssh")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.startSsh({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
      envId: optionToUndefined(input.envId),
      tabType: input.tabType,
      resolveArgs: !input.json,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    if (result.view.sshArgs !== null) {
      yield* runSsh(result.view.sshArgs);
    }
  }),
).pipe(
  Command.withDescription("Connect to a shixun runtime through SSH when available."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun ssh 109348 3487324 --env-id 1128633",
      description: "Connect to one environment by env id",
    },
    {
      command: "open-educoder homework shixun ssh 109348 3487324 --tab-type 4 --json",
      description: "Print SSH connection arguments as JSON",
    },
  ]),
  Command.withAlias("r"),
);
