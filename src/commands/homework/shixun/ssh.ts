import { Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import { EducoderApi } from "../../../services/educoder-api/index.js";
import { EnvironmentId, HomeworkId, TaskId, TerminalTabType } from "../flags.js";
import { asRecord, failInput, printJson, resolveHomeworkContext, stringField } from "../shared.js";

const parsePort = (value: unknown) => {
  const port = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;

  return Number.isInteger(port) && port >= 1 && port <= 65535 ? port : null;
};

const resolveSshArgs = (value: unknown) => {
  const root = asRecord(value);
  const data = asRecord(root?.["data"]) ?? root;
  const host = stringField(data, "ssh_address") ?? stringField(data, "sshAddress") ?? stringField(data, "host");
  const user = stringField(data, "username") ?? stringField(data, "user") ?? stringField(data, "login");
  const port = parsePort(data?.["port"]);

  if (host === null) {
    return failInput("Cannot infer SSH target from terminal start response. Re-run with --json to inspect it.");
  }

  const target = user === null ? host : `${user}@${host}`;

  return Effect.succeed(port === null ? [target] : ["-p", String(port), target]);
};

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
    taskId: TaskId,
    homeworkId: HomeworkId,
    envId: EnvironmentId,
    tabType: TerminalTabType,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.ssh")(function* (input) {
    const educoder = yield* EducoderApi;
    const { user, context } = yield* resolveHomeworkContext({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      envId: input.envId,
      tabType: input.tabType,
    });
    const response = yield* educoder.Myshixun.start({
      params: {
        myshixunId: context.myshixunIdentifier,
      },
      query: {
        shixun_environment_id: context.environmentId,
        tab_type: input.tabType,
        game_id: context.gameId,
        homework_common_id: input.homeworkId,
        zzud: user.login,
      },
    });

    if (input.json) {
      return yield* printJson(response);
    }

    const sshArgs = yield* resolveSshArgs(response);

    yield* runSsh(sshArgs);
  }),
).pipe(
  Command.withDescription("Start an SSH session for a shixun homework environment."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun ssh sflmr2fxi4wn --homework-id 3487324 --env-id 1128633",
      description: "Connect to the specified environment with local ssh",
    },
    {
      command: "open-educoder homework shixun ssh sflmr2fxi4wn --homework-id 3487324 --tab-type 4 --json",
      description: "Print the raw terminal start response as JSON",
    },
  ]),
  Command.withAlias("r"),
);
