import { Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import { EducoderApi } from "../../services/educoder-api/index.js";
import { EnvironmentId, HomeworkId, TaskId, TerminalTabType } from "./flags.js";
import {
  type JsonRecord,
  asRecord,
  failInput,
  fetchTaskInfo,
  numberField,
  parseTaskContext,
  printJson,
  resolveLogin,
  stringField,
} from "./shared.js";

const SshCommandKeys = [
  "ssh",
  "sshCommand",
  "ssh_command",
  "ssh_cmd",
  "sshUrl",
  "ssh_url",
  "command",
  "cmd",
] as const;
const HostKeys = [
  "host",
  "hostname",
  "ip",
  "address",
  "server",
  "domain",
  "sshHost",
  "ssh_host",
  "sshHostname",
  "ssh_hostname",
  "sshAddress",
  "ssh_address",
] as const;
const UserKeys = ["user", "username", "login", "sshUser", "ssh_user"] as const;
const PortKeys = ["port", "sshPort", "ssh_port"] as const;

const nestedValues = (value: unknown): ReadonlyArray<unknown> => {
  const record = asRecord(value);

  if (record !== null) {
    return Object.values(record);
  }

  return Array.isArray(value) ? value : [];
};

const directString = (record: JsonRecord, keys: ReadonlyArray<string>): string | null => {
  for (const key of keys) {
    const value = stringField(record, key);

    if (value !== null && value.length >= 1) {
      return value;
    }
  }

  return null;
};

const directPort = (record: JsonRecord): number | null => {
  for (const key of PortKeys) {
    const directNumber = numberField(record, key);
    const directString = stringField(record, key);
    const parsedString = directString === null ? Number.NaN : Number.parseInt(directString, 10);
    const port = directNumber ?? parsedString;

    if (Number.isInteger(port) && port >= 1 && port <= 65535) {
      return port;
    }
  }

  return null;
};

const findString = (value: unknown, keys: ReadonlyArray<string>): string | null => {
  const record = asRecord(value);

  if (record !== null) {
    const value = directString(record, keys);

    if (value !== null) {
      return value;
    }
  }

  for (const nested of nestedValues(value)) {
    const result = findString(nested, keys);

    if (result !== null) {
      return result;
    }
  }

  return null;
};

const splitShellWords = (value: string): ReadonlyArray<string> | null => {
  const words: Array<string> = [];
  let current = "";
  let quote: '"' | "'" | null = null;
  let escaped = false;

  const pushCurrent = () => {
    if (current.length >= 1) {
      words.push(current);
      current = "";
    }
  };

  for (const char of value.trim()) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\" && quote !== "'") {
      escaped = true;
      continue;
    }

    if (quote !== null) {
      if (char === quote) {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }

    if (/\s/.test(char)) {
      pushCurrent();
      continue;
    }

    current += char;
  }

  if (escaped || quote !== null) {
    return null;
  }

  pushCurrent();

  return words;
};

const sshArgsFromUrl = (value: string): ReadonlyArray<string> | null => {
  try {
    const url = new URL(value);

    if (url.protocol !== "ssh:" || url.hostname.length < 1) {
      return null;
    }

    const args = url.port.length >= 1 ? ["-p", url.port] : [];
    const user = decodeURIComponent(url.username);
    const target = user.length >= 1 ? `${user}@${url.hostname}` : url.hostname;

    return [...args, target];
  } catch {
    return null;
  }
};

const sshArgsFromCommand = (value: string): ReadonlyArray<string> | null => {
  const fromUrl = sshArgsFromUrl(value);

  if (fromUrl !== null) {
    return fromUrl;
  }

  const words = splitShellWords(value);

  if (words === null || words.length < 1) {
    return null;
  }

  const command = words[0];

  if (command === undefined || (command !== "ssh" && !command.endsWith("/ssh"))) {
    return null;
  }

  return words.slice(1);
};

const sshArgsFromFields = (value: unknown): ReadonlyArray<string> | null => {
  const record = asRecord(value);

  if (record !== null) {
    const host = directString(record, HostKeys);

    if (host !== null) {
      const user = directString(record, UserKeys);
      const port = directPort(record);
      const target = user === null ? host : `${user}@${host}`;

      return port === null ? [target] : ["-p", String(port), target];
    }
  }

  for (const nested of nestedValues(value)) {
    const args = sshArgsFromFields(nested);

    if (args !== null) {
      return args;
    }
  }

  return null;
};

const resolveSshArgs = (value: unknown) => {
  const command = findString(value, SshCommandKeys);
  const fromCommand = command === null ? null : sshArgsFromCommand(command);
  const args = fromCommand ?? sshArgsFromFields(value);

  return args === null || args.length < 1
    ? failInput("Cannot infer SSH target from terminal start response. Re-run with --json to inspect it.")
    : Effect.succeed(args);
};

const runSsh = Effect.fn("homework.ssh.runSsh")(function* (args: ReadonlyArray<string>) {
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

export const sshCommand = Command.make(
  "ssh",
  {
    taskId: TaskId,
    homeworkId: HomeworkId,
    envId: EnvironmentId,
    tabType: TerminalTabType,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.ssh")(function* (input) {
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin();
    const taskInfo = yield* fetchTaskInfo({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      login,
    });
    const context = yield* parseTaskContext(taskInfo, input.envId, input.tabType);
    const response = yield* educoder.Myshixun.start({
      params: {
        myshixunId: context.myshixunIdentifier,
      },
      query: {
        shixun_environment_id: context.environmentId,
        tab_type: input.tabType,
        game_id: context.gameId,
        homework_common_id: input.homeworkId,
        zzud: login,
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
      command: "open-educoder homework ssh sflmr2fxi4wn --homework-id 3487324 --env-id 1128633",
      description: "Connect to the specified environment with local ssh",
    },
    {
      command: "open-educoder homework ssh sflmr2fxi4wn --homework-id 3487324 --tab-type 4 --json",
      description: "Print the raw terminal start response as JSON",
    },
  ]),
  Command.withAlias("r"),
);
