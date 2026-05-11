import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import nodePath from "node:path";
import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../../services/educoder-api/index.js";
import { EnvironmentId, HomeworkId, RepositoryPath, TabType, TaskId } from "./flags.js";
import {
  decodeBase64,
  failInput,
  fetchTaskInfo,
  HomeworkInputError,
  inspectOptions,
  makeUpdateFilePayload,
  parseTaskContext,
  printJson,
  resolveCurrentUser,
} from "./shared.js";

type EditedContent = {
  readonly editor: string;
  readonly directory: string;
  readonly file: string;
  readonly content: string;
};

const formatUnknownError = (error: unknown) => {
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
  const basename = nodePath.basename(repositoryPath);

  return basename.length >= 1 && basename !== "." && basename !== ".." ? basename : "content";
};

const runEditor = (editor: string, file: string) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(`${editor} ${shellQuote(file)}`, {
      shell: true,
      stdio: "inherit",
    });

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal !== null) {
        reject(new Error(`editor exited after receiving ${signal}`));
        return;
      }

      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`editor exited with status ${code === null ? "unknown" : code}`));
    });
  });

const editContent = Effect.fn("homework.editContent")(function* (input: {
  readonly repositoryPath: string;
  readonly content: string;
}) {
  const editor = resolveEditor();

  if (editor === null) {
    return yield* failInput("Set $VISUAL or $EDITOR to edit homework files.");
  }

  return yield* Effect.tryPromise({
    try: async (): Promise<EditedContent> => {
      const directory = await mkdtemp(nodePath.join(tmpdir(), "open-educoder-edit-"));
      const file = nodePath.join(directory, temporaryFilename(input.repositoryPath));

      try {
        await writeFile(file, input.content, "utf8");
        await runEditor(editor, file);

        return {
          editor,
          directory,
          file,
          content: await readFile(file, "utf8"),
        };
      } catch (error) {
        throw new Error(`${formatUnknownError(error)}; edited file kept at ${file}`);
      }
    },
    catch: (error) =>
      new HomeworkInputError({
        message: `Failed to edit ${input.repositoryPath}: ${formatUnknownError(error)}`,
      }),
  });
});

const cleanupTemporaryDirectory = (directory: string) =>
  Effect.promise(async () => {
    await rm(directory, { recursive: true, force: true }).catch(() => undefined);
  });

export const editCommand = Command.make(
  "edit",
  {
    taskId: TaskId,
    path: RepositoryPath,
    homeworkId: HomeworkId,
    exerciseId: Flag.string("exercise-id").pipe(Flag.withDefault("")),
    evaluate: Flag.boolean("evaluate"),
    envId: EnvironmentId,
    tabType: TabType,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.edit")(function* (input) {
    const educoder = yield* EducoderApi;
    const user = yield* resolveCurrentUser();
    const taskInfo = yield* fetchTaskInfo({
      taskId: input.taskId,
      homeworkId: input.homeworkId,
      login: user.login,
    });
    const context = yield* parseTaskContext(taskInfo, input.envId, input.tabType);
    const contentResponse = yield* educoder.Task.repContent({
      params: {
        taskId: input.taskId,
      },
      query: {
        path: input.path,
        homework_common_id: input.homeworkId,
        exercise_id: input.exerciseId,
        zzud: user.login,
      },
    });
    const currentContent = decodeBase64(contentResponse.content.content);
    const edited = yield* editContent({
      repositoryPath: input.path,
      content: currentContent,
    });
    const changed = edited.content !== currentContent;

    if (!changed) {
      yield* cleanupTemporaryDirectory(edited.directory);

      if (input.json) {
        return yield* printJson({
          edit: {
            path: input.path,
            editor: edited.editor,
            changed,
          },
          save: null,
        });
      }

      return yield* Console.dir(
        {
          edit: {
            path: input.path,
            editor: edited.editor,
            changed,
          },
        },
        inspectOptions,
      );
    }

    const saveResponse = yield* educoder.Myshixun.updateFile({
      params: {
        myshixunId: context.myshixunIdentifier,
      },
      query: {
        zzud: user.login,
      },
      payload: makeUpdateFilePayload({
        homeworkId: input.homeworkId,
        path: input.path,
        content: edited.content,
        evaluate: input.evaluate,
        context,
        user,
        tabType: input.tabType,
      }),
    }).pipe(
      Effect.mapError(
        (error) =>
          new HomeworkInputError({
            message: `Failed to save edited content; edited file kept at ${edited.file}: ${formatUnknownError(error)}`,
          }),
      ),
    );

    yield* cleanupTemporaryDirectory(edited.directory);

    if (input.json) {
      return yield* printJson({
        edit: {
          path: input.path,
          editor: edited.editor,
          changed,
        },
        save: saveResponse,
      });
    }

    yield* Console.dir(
      {
        edit: {
          path: input.path,
          editor: edited.editor,
          changed,
          commitId: saveResponse.content.commitID,
          secKey: saveResponse.sec_key,
          resubmit: saveResponse.resubmit,
          contentModified: saveResponse.content_modified,
          size: saveResponse.content.size,
        },
      },
      inspectOptions,
    );
  }),
).pipe(
  Command.withDescription("Edit a shixun homework repository file with $VISUAL or $EDITOR, then save changes."),
  Command.withExamples([
    {
      command: "open-educoder homework edit sflmr2fxi4wn case1/code.sh --homework-id 3487324",
      description: "Open a task file in $VISUAL or $EDITOR and save it back after changes",
    },
    {
      command: "VISUAL='code --wait' open-educoder homework edit sflmr2fxi4wn case1/code.sh --homework-id 3487324",
      description: "Use an editor command that waits until the edit is complete",
    },
  ]),
  Command.withAlias("D"),
);
