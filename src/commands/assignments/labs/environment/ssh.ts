import { Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import {
  AssignmentIdArgument,
  ChallengeId,
  ChallengeIndex,
  CourseId,
  EnvironmentId,
  TerminalTabType,
} from "../../flags.js";
import { optionToUndefined, printJson } from "../../shared.js";

const runSsh = Effect.fn("assignments.labs.ssh.runSsh")(function* (args: ReadonlyArray<string>) {
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
    homeworkId: AssignmentIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    envId: EnvironmentId,
    tabType: TerminalTabType,
    json: Flag.boolean("json").pipe(
      Flag.withDescription("Print SSH connection arguments as JSON instead of running ssh."),
    ),
  },
  Effect.fn("assignments.labs.ssh")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.startSsh({
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
  Command.withDescription("Resolve SSH connection details for a lab runtime and connect with local ssh."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs ssh 109348 3487324 --env-id 1128633",
      description: "Connect to one environment by env id",
    },
    {
      command: "open-educoder assignments labs ssh 109348 3487324 --tab-type 4 --json",
      description: "Print SSH connection arguments as JSON",
    },
  ]),
  Command.withAlias("r"),
);
