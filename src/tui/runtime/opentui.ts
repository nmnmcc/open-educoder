import { spawn, spawnSync } from "node:child_process";

import { Effect } from "effect";

const RelaunchedEnv = "OPEN_EDUCODER_OPENTUI_REEXEC";
const FfiFlags = ["--experimental-ffi", "--allow-ffi"] as const;
const NodeFfiModule = "node:ffi";

const isBun = () => (process.versions as Record<string, string | undefined>)["bun"] !== undefined;

const hasNodeFfi = async () => {
  if (isBun()) {
    return true;
  }

  try {
    await import(NodeFfiModule);

    return true;
  } catch {
    return false;
  }
};

const nodeAcceptsFfiFlags = () => {
  const result = spawnSync(process.execPath, [...FfiFlags, "--eval", ""], { stdio: "ignore" });

  return result.status === 0;
};

const relaunchWithFfiFlags = () =>
  new Promise<never>((_resolve, reject) => {
    const existing = new Set(process.execArgv);
    const flags = FfiFlags.filter((flag) => !existing.has(flag));
    const child = spawn(process.execPath, [...flags, ...process.execArgv, ...process.argv.slice(1)], {
      env: { ...process.env, [RelaunchedEnv]: "1" },
      stdio: "inherit",
    });

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal !== null) {
        process.kill(process.pid, signal);
        return;
      }

      process.exit(code ?? 1);
    });
  });

export const ensureOpenTuiRuntime = Effect.fn("tui.runtime.ensureOpenTui")(function* () {
  if (yield* Effect.promise(hasNodeFfi)) {
    return;
  }

  if (process.env[RelaunchedEnv] !== "1" && nodeAcceptsFfiFlags()) {
    yield* Effect.promise(relaunchWithFfiFlags);
    return;
  }

  throw new Error(
    "OpenTUI requires Bun or a Node.js build that exposes node:ffi. This Node.js runtime cannot load node:ffi.",
  );
});
