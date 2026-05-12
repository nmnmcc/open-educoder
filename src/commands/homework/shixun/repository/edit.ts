import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import nodePath from "node:path";

import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import {
  ChallengeId,
  ChallengeIndex,
  CourseId,
  EnvironmentId,
  HomeworkIdArgument,
  RepositoryPath,
  TabType,
} from "../../flags.js";
import { renderGeneric } from "../../render.js";
import { HomeworkInputError, failInput, optionToUndefined, printJson } from "../../shared.js";

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

const editContent = Effect.fn("homework.shixun.editContent")(function* (input: {
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

export const Edit = Command.make(
  "edit",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    path: RepositoryPath,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    exerciseId: Flag.string("exercise-id").pipe(Flag.withDefault("")),
    evaluate: Flag.boolean("evaluate"),
    envId: EnvironmentId,
    tabType: TabType,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.edit")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const challengeIndex = optionToUndefined(input.challengeIndex);
    const challengeId = optionToUndefined(input.challengeId);
    const contentResult = yield* homeworkShixunFeature.getRepositoryContent({
      courseId: input.courseId,
      path: input.path,
      homeworkId: input.homeworkId,
      challengeIndex,
      challengeId,
      exerciseId: input.exerciseId,
    });
    const currentContent = contentResult.view.decodedContent;
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

      return yield* Console.log(
        renderGeneric("编辑结果 / Edit Result", {
          edit: {
            path: input.path,
            editor: edited.editor,
            changed,
          },
        }),
      );
    }

    const saveResult = yield* homeworkShixunFeature
      .saveRepositoryFile({
        courseId: input.courseId,
        path: input.path,
        homeworkId: input.homeworkId,
        challengeIndex,
        challengeId,
        content: edited.content,
        evaluate: input.evaluate,
        envId: optionToUndefined(input.envId),
        tabType: input.tabType,
      })
      .pipe(
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
        save: saveResult.raw,
      });
    }

    yield* Console.log(
      renderGeneric("编辑结果 / Edit Result", {
        edit: {
          editor: edited.editor,
          changed,
          ...saveResult.view.saved,
        },
      }),
    );
  }),
).pipe(
  Command.withDescription("Open a repository file in $VISUAL/$EDITOR, then save back any edits."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun edit 109348 3487324 case1/code.sh",
      description: "Edit a task file interactively and save the changes",
    },
    {
      command: "VISUAL='code --wait' open-educoder homework shixun edit 109348 3487324 case1/code.sh",
      description: "Use an editor command that blocks until saving is complete",
    },
  ]),
  Command.withAlias("D"),
);
