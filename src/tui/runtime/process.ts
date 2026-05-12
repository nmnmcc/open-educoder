import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export type EditedContent = {
  readonly editor: string;
  readonly directory: string;
  readonly file: string;
  readonly content: string;
};

const AlternateScreenOff = "\u001B[?1049l";
const AlternateScreenOn = "\u001B[?1049h";

export const formatError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error) ?? String(error);
  } catch {
    return String(error);
  }
};

export const readUtf8File = (file: string) => readFile(file, "utf8");

export const cleanupEditedContent = (edited: EditedContent) => rm(edited.directory, { recursive: true, force: true });

const resolveEditor = () => {
  const visual = process.env["VISUAL"]?.trim();

  if (visual !== undefined && visual.length >= 1) {
    return visual;
  }

  const editor = process.env["EDITOR"]?.trim();

  if (editor !== undefined && editor.length >= 1) {
    return editor;
  }

  return null;
};

const shellQuote = (value: string) => `'${value.replaceAll("'", "'\\''")}'`;

const temporaryFilename = (repositoryPath: string) => {
  const basename = path.basename(repositoryPath);

  return basename.length >= 1 && basename !== "." && basename !== ".." ? basename : "content";
};

const setRawMode = (enabled: boolean) => {
  const stdin = process.stdin as NodeJS.ReadStream & {
    readonly isRaw?: boolean | undefined;
    readonly setRawMode?: ((mode: boolean) => void) | undefined;
  };

  if (stdin.isTTY && stdin.setRawMode !== undefined) {
    stdin.setRawMode(enabled);
  }
};

const suspendAlternateScreen = async <A>(run: () => Promise<A>) => {
  const stdin = process.stdin as NodeJS.ReadStream & { readonly isRaw?: boolean | undefined };
  const wasRaw = stdin.isRaw === true;

  setRawMode(false);
  process.stdout.write(AlternateScreenOff);

  try {
    return await run();
  } finally {
    process.stdout.write(AlternateScreenOn);
    setRawMode(wasRaw);
  }
};

const runProcess = (command: string, args: ReadonlyArray<string>, shell: boolean) =>
  suspendAlternateScreen(
    () =>
      new Promise<void>((resolve, reject) => {
        const child = spawn(command, args, {
          shell,
          stdio: "inherit",
        });

        child.once("error", reject);
        child.once("exit", (code, signal) => {
          if (signal !== null) {
            reject(new Error(`${command} exited after receiving ${signal}`));
            return;
          }

          if (code === 0) {
            resolve();
            return;
          }

          reject(new Error(`${command} exited with status ${code === null ? "unknown" : code}`));
        });
      }),
  );

export const runSsh = (args: ReadonlyArray<string>) => runProcess("ssh", args, false);

export const editInExternalEditor = async (repositoryPath: string, content: string): Promise<EditedContent> => {
  const editor = resolveEditor();

  if (editor === null) {
    throw new Error("Set $VISUAL or $EDITOR to edit repository files.");
  }

  const directory = await mkdtemp(path.join(tmpdir(), "open-educoder-tui-edit-"));
  const file = path.join(directory, temporaryFilename(repositoryPath));

  try {
    await writeFile(file, content, "utf8");
    await runProcess(`${editor} ${shellQuote(file)}`, [], true);

    return {
      editor,
      directory,
      file,
      content: await readFile(file, "utf8"),
    };
  } catch (error) {
    throw new Error(`Failed to edit ${repositoryPath}; edited file kept at ${file}: ${formatError(error)}`);
  }
};
