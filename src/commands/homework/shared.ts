import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { Console, Data, Effect, Option } from "effect";
import { AppContext } from "../../services/context/index.js";
import { EducoderApi } from "../../services/educoder-api/index.js";
import { inspectOptions } from "../../utils/inspect-options.js";

export { inspectOptions };

export class HomeworkInputError extends Data.TaggedError("HomeworkInputError")<{
  readonly message: string;
}> {}

export type JsonRecord = Record<string, unknown>;

export type CurrentUser = {
  readonly login: string;
  readonly userId: number;
};

export type TaskContext = {
  readonly gameId: number;
  readonly challengeId: number;
  readonly challengePath: string;
  readonly myshixunId: number;
  readonly myshixunIdentifier: string;
  readonly environmentId: number;
};

export const printJson = (value: unknown) => Console.log(JSON.stringify(value, null, 2));

export const resolveCurrentUser = Effect.fn("homework.resolveCurrentUser")(function* () {
  const ctx = yield* AppContext;
  const user = yield* ctx.user;

  return {
    login: user.login,
    userId: user.user_id,
  };
});

export const resolveLogin = Effect.fn("homework.resolveLogin")(function* () {
  const user = yield* resolveCurrentUser();

  return user.login;
});

export const decodeBase64 = (value: string) => Buffer.from(value, "base64").toString("utf8");

export const formatLabels = (labels: ReadonlyArray<string>) => labels.join(", ");

export const formatOperation = (operation: ReadonlyArray<unknown> | undefined) => {
  const action = operation?.[0];
  const path = operation?.[1];
  const resumed = operation?.[2];

  return {
    action: typeof action === "string" ? action : null,
    path: typeof path === "string" ? path : null,
    resumed: typeof resumed === "boolean" ? resumed : null,
  };
};

export const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const asRecord = (value: unknown): JsonRecord | null => (isRecord(value) ? value : null);

export const asArray = (value: unknown): ReadonlyArray<unknown> => (Array.isArray(value) ? value : []);

export const stringField = (record: JsonRecord | null, key: string) => {
  const value = record?.[key];

  return typeof value === "string" ? value : null;
};

export const numberField = (record: JsonRecord | null, key: string) => {
  const value = record?.[key];

  return typeof value === "number" ? value : null;
};

export const booleanField = (record: JsonRecord | null, key: string) => {
  const value = record?.[key];

  return typeof value === "boolean" ? value : null;
};

export const failInput = (message: string) => Effect.fail(new HomeworkInputError({ message }));

const requiredRecord = (value: unknown, name: string) =>
  isRecord(value) ? Effect.succeed(value) : failInput(`Cannot read ${name} from task response.`);

const requiredString = (value: unknown, name: string) =>
  typeof value === "string" && value.length >= 1 ? Effect.succeed(value) : failInput(`Cannot read ${name}.`);

const requiredNumber = (value: unknown, name: string) =>
  typeof value === "number" && Number.isFinite(value) ? Effect.succeed(value) : failInput(`Cannot read ${name}.`);

export const readContent = Effect.fn("homework.readContent")(function* (input: {
  readonly content: Option.Option<string>;
  readonly file: Option.Option<string>;
}) {
  if (Option.isSome(input.content) && Option.isSome(input.file)) {
    return yield* failInput("Use either --content or --file, not both.");
  }

  if (Option.isSome(input.content)) {
    return input.content.value;
  }

  if (Option.isSome(input.file)) {
    const file = input.file.value;

    return yield* Effect.tryPromise({
      try: () => readFile(file, "utf8"),
      catch: (error) =>
        new HomeworkInputError({
          message: `Failed to read ${file}: ${error instanceof Error ? error.message : String(error)}`,
        }),
    });
  }

  return yield* failInput("Provide file content with --content or --file.");
});

export const makeTaskQuery = (taskId: string, homeworkId: string, login: string) => ({
  params: {
    taskId,
  },
  query: {
    homework_common_id: homeworkId,
    zzud: login,
  },
});

export const fetchTaskInfo = Effect.fn("homework.fetchTaskInfo")(function* (input: {
  readonly taskId: string;
  readonly homeworkId: string;
  readonly login: string;
}) {
  const educoder = yield* EducoderApi;

  return yield* educoder.Task.info(makeTaskQuery(input.taskId, input.homeworkId, input.login));
});

const resolveEnvironmentId = Effect.fn("homework.resolveEnvironmentId")(function* (
  taskInfo: unknown,
  envId: Option.Option<number>,
  tabType: number,
) {
  if (Option.isSome(envId)) {
    return envId.value;
  }

  const root = yield* requiredRecord(taskInfo, "root");
  const codeEditor = asRecord(root["code_editor"]);
  const codeEditorEnvironmentId = numberField(codeEditor, "shixun_environment_id");

  if (tabType === 1 && codeEditorEnvironmentId !== null) {
    return codeEditorEnvironmentId;
  }

  for (const environment of asArray(root["shixun_environments"])) {
    const record = asRecord(environment);
    const candidateTabType = numberField(record, "tab_type");
    const candidateEnvironmentId = numberField(record, "shixun_environment_id");

    if (candidateTabType === tabType && candidateEnvironmentId !== null) {
      return candidateEnvironmentId;
    }
  }

  for (const environment of asArray(root["shixun_environments"])) {
    const record = asRecord(environment);
    const candidateEnvironmentId = numberField(record, "shixun_environment_id");

    if (candidateEnvironmentId !== null) {
      return candidateEnvironmentId;
    }
  }

  return yield* failInput("Cannot infer shixun environment id. Pass --env-id explicitly.");
});

export const parseTaskContext = Effect.fn("homework.parseTaskContext")(function* (
  taskInfo: unknown,
  envId: Option.Option<number>,
  tabType: number,
) {
  const root = yield* requiredRecord(taskInfo, "root");
  const game = yield* requiredRecord(root["game"], "game");
  const challenge = yield* requiredRecord(root["challenge"], "challenge");
  const myshixun = yield* requiredRecord(root["myshixun"], "myshixun");
  const environmentId = yield* resolveEnvironmentId(taskInfo, envId, tabType);

  return {
    gameId: yield* requiredNumber(game["id"], "game.id"),
    challengeId: yield* requiredNumber(challenge["id"], "challenge.id"),
    challengePath: yield* requiredString(challenge["path"], "challenge.path"),
    myshixunId: yield* requiredNumber(myshixun["id"] ?? game["myshixun_id"], "myshixun.id"),
    myshixunIdentifier: yield* requiredString(myshixun["identifier"], "myshixun.identifier"),
    environmentId,
  } satisfies TaskContext;
});

export const resolveHomeworkContext = Effect.fn("homework.resolveHomeworkContext")(function* (input: {
  readonly taskId: string;
  readonly homeworkId: string;
  readonly envId: Option.Option<number>;
  readonly tabType: number;
}) {
  const user = yield* resolveCurrentUser();
  const taskInfo = yield* fetchTaskInfo({
    taskId: input.taskId,
    homeworkId: input.homeworkId,
    login: user.login,
  });
  const context = yield* parseTaskContext(taskInfo, input.envId, input.tabType);

  return {
    user,
    context,
  };
});

export const fetchRepositoryContent = Effect.fn("homework.fetchRepositoryContent")(function* (input: {
  readonly taskId: string;
  readonly homeworkId: string;
  readonly path: string;
  readonly exerciseId: string;
  readonly login: string;
}) {
  const educoder = yield* EducoderApi;

  return yield* educoder.Task.repContent({
    params: {
      taskId: input.taskId,
    },
    query: {
      path: input.path,
      homework_common_id: input.homeworkId,
      exercise_id: input.exerciseId,
      zzud: input.login,
    },
  });
});

export const formatTaskInfo = (value: unknown) => {
  const root = asRecord(value);
  const game = asRecord(root?.["game"]);
  const challenge = asRecord(root?.["challenge"]);
  const shixun = asRecord(root?.["shixun"]);
  const myshixun = asRecord(root?.["myshixun"]);
  const user = asRecord(root?.["user"]);
  const environments = Object.fromEntries(
    asArray(root?.["shixun_environments"]).map((environment, index) => {
      const record = asRecord(environment);
      const id = numberField(record, "shixun_environment_id") ?? index + 1;

      return [
        id,
        {
          name: stringField(record, "name"),
          tabType: numberField(record, "tab_type"),
          resourceType: numberField(record, "resource_type"),
          tpiType: numberField(record, "tpi_type"),
        },
      ];
    }),
  );
  const testSets = Object.fromEntries(
    asArray(root?.["test_sets"]).map((testSet, index) => {
      const record = asRecord(testSet);

      return [
        index + 1,
        {
          public: booleanField(record, "is_public"),
          result: booleanField(record, "result"),
          expected: stringField(record, "output"),
          actual: stringField(record, "actual_output"),
          matchRule: stringField(record, "matchRule"),
        },
      ];
    }),
  );

  return {
    homework: {
      id: numberField(root, "homework_common_id"),
      name: stringField(root, "homework_common_name"),
      ended: booleanField(root, "homework_common_is_end"),
    },
    task: {
      identifier: stringField(game, "identifier"),
      gameId: numberField(game, "id"),
      status: numberField(game, "status"),
      finalScore: numberField(game, "final_score"),
      costTime: numberField(game, "cost_time"),
    },
    challenge: {
      id: numberField(challenge, "id"),
      position: numberField(challenge, "position"),
      subject: stringField(challenge, "subject"),
      score: numberField(challenge, "score"),
      path: stringField(challenge, "path"),
      difficulty: numberField(challenge, "difficulty"),
      execTime: numberField(challenge, "exec_time"),
    },
    shixun: {
      id: numberField(shixun, "id"),
      identifier: stringField(shixun, "identifier"),
      name: stringField(shixun, "name"),
      language: stringField(shixun, "language"),
      status: numberField(root, "shixun_status"),
    },
    myshixun: {
      id: numberField(myshixun, "id"),
      identifier: stringField(myshixun, "identifier"),
      status: numberField(myshixun, "status"),
      commitId: stringField(myshixun, "commit_id"),
    },
    user: {
      id: numberField(user, "user_id"),
      login: stringField(user, "login"),
      name: stringField(user, "name"),
    },
    environments,
    testSets,
  };
};

export const formatStatusResponse = (value: unknown) => {
  const root = asRecord(value);
  const runningStatus = numberField(root, "running_code_status");

  if (runningStatus !== null) {
    return {
      running: {
        status: runningStatus,
        message: stringField(root, "running_code_message"),
      },
    };
  }

  const testSets = Object.fromEntries(
    asArray(root?.["test_sets"]).map((testSet, index) => {
      const record = asRecord(testSet);

      return [
        index + 1,
        {
          result: booleanField(record, "result"),
          expected: stringField(record, "output"),
          actual: stringField(record, "actual_output"),
          compileSuccess: numberField(record, "compile_success"),
          time: numberField(record, "ts_time"),
          memory: numberField(record, "ts_mem"),
          matchRule: stringField(record, "matchRule"),
        },
      ];
    }),
  );

  return {
    result: {
      status: numberField(root, "status"),
      grade: numberField(root, "grade"),
      gold: numberField(root, "gold"),
      experience: numberField(root, "experience"),
      position: numberField(root, "position"),
      lastCompileOutput: stringField(root, "last_compile_output"),
      secKey: stringField(root, "sec_key"),
      testSetsCount: numberField(root, "test_sets_count"),
      errorCount: numberField(root, "sets_error_count"),
    },
    testSets,
  };
};

const isRunningStatusResponse = (value: unknown) => numberField(asRecord(value), "running_code_status") !== null;

export const printStatusResponse = Effect.fn("homework.printStatusResponse")(function* (
  response: unknown,
  json: boolean,
) {
  if (json) {
    return yield* printJson(response);
  }

  yield* Console.dir(formatStatusResponse(response), inspectOptions);
});

export const makeUpdateFilePayload = (input: {
  readonly homeworkId: string;
  readonly path: string;
  readonly content: string;
  readonly evaluate: boolean;
  readonly context: TaskContext;
  readonly user: CurrentUser;
  readonly tabType: number;
}) => ({
  path: input.path,
  evaluate: input.evaluate ? 1 : 0,
  content: input.content,
  game_id: input.context.gameId,
  tab_type: input.tabType,
  exercise_id: null,
  homework_common_id: input.homeworkId,
  extras: {
    exercise_id: "",
    question_id: "",
    challenge_id: input.context.challengeId,
    subject_id: "",
    homework_common_id: input.homeworkId,
    competition_entry_id: "",
    currentUserId: input.user.userId,
  },
});

export const saveRepositoryFile = Effect.fn("homework.saveRepositoryFile")(function* (input: {
  readonly homeworkId: string;
  readonly path: string;
  readonly content: string;
  readonly evaluate: boolean;
  readonly context: TaskContext;
  readonly user: CurrentUser;
  readonly tabType: number;
}) {
  const educoder = yield* EducoderApi;

  return yield* educoder.Myshixun.updateFile({
    params: {
      myshixunId: input.context.myshixunIdentifier,
    },
    query: {
      zzud: input.user.login,
    },
    payload: makeUpdateFilePayload(input),
  });
});

export const makeGameBuildPayload = (input: {
  readonly homeworkId: string;
  readonly secKey: string;
  readonly resubmit: string;
  readonly commitId: string;
  readonly contentModified: number;
  readonly context: TaskContext;
  readonly user: CurrentUser;
  readonly tabType: number;
}) => ({
  sec_key: input.secKey,
  resubmit: input.resubmit,
  first: 1,
  content_modified: input.contentModified,
  shixun_environment_id: input.context.environmentId,
  tab_type: input.tabType,
  extras: {
    exercise_id: "",
    question_id: "",
    challenge_id: input.context.challengeId,
    subject_id: "",
    homework_common_id: input.homeworkId,
    competition_entry_id: "",
    commitID: input.commitId,
    currentUserId: input.user.userId,
  },
});

export const buildRepositoryFile = Effect.fn("homework.buildRepositoryFile")(function* (input: {
  readonly taskId: string;
  readonly homeworkId: string;
  readonly secKey: string;
  readonly resubmit: string;
  readonly commitId: string;
  readonly contentModified: number;
  readonly context: TaskContext;
  readonly user: CurrentUser;
  readonly tabType: number;
}) {
  const educoder = yield* EducoderApi;

  return yield* educoder.Task.gameBuild({
    params: {
      taskId: input.taskId,
    },
    query: {
      zzud: input.user.login,
    },
    payload: makeGameBuildPayload(input),
  });
});

export const formatSaveResponse = (
  path: string,
  response: {
    readonly content: {
      readonly commitID: string;
      readonly size: number;
    };
    readonly sec_key: string | null | undefined;
    readonly resubmit: string | null | undefined;
    readonly content_modified: number;
  },
) => ({
  path,
  commitId: response.content.commitID,
  secKey: response.sec_key,
  resubmit: response.resubmit,
  contentModified: response.content_modified,
  size: response.content.size,
});

export const makeStatusRequest = (input: {
  readonly taskId: string;
  readonly homeworkId: string;
  readonly login: string;
  readonly secKey: string;
  readonly challengeId: number;
  readonly resubmit: string;
  readonly timeOut: boolean;
  readonly port: number;
  readonly subjectId: string;
}) => ({
  params: {
    taskId: input.taskId,
  },
  query: {
    resubmit: input.resubmit,
    time_out: input.timeOut,
    port: input.port,
    sec_key: input.secKey,
    challenge_id: input.challengeId,
    subject_id: input.subjectId,
    homework_common_id: input.homeworkId,
    zzud: input.login,
  },
});

export const pollGameStatus = Effect.fn("homework.pollGameStatus")(function* (input: {
  readonly taskId: string;
  readonly homeworkId: string;
  readonly login: string;
  readonly secKey: string;
  readonly challengeId: number;
  readonly resubmit: string;
  readonly timeOut: boolean;
  readonly port: number;
  readonly subjectId: string;
  readonly interval: number;
  readonly limit: number;
  readonly quiet: boolean;
}) {
  const educoder = yield* EducoderApi;
  let lastResponse: unknown = null;

  for (let attempt = 1; attempt <= input.limit; attempt += 1) {
    const response = yield* educoder.Task.gameStatus(
      makeStatusRequest({
        taskId: input.taskId,
        homeworkId: input.homeworkId,
        login: input.login,
        secKey: input.secKey,
        challengeId: input.challengeId,
        resubmit: input.resubmit,
        timeOut: input.timeOut,
        port: input.port,
        subjectId: input.subjectId,
      }),
    );
    lastResponse = response;

    if (!isRunningStatusResponse(response)) {
      return response;
    }

    if (!input.quiet) {
      const running = asRecord(response);
      yield* Console.log(`[${attempt}/${input.limit}] ${stringField(running, "running_code_message") ?? "running"}`);
    }

    if (attempt < input.limit) {
      yield* Effect.sleep(`${input.interval} seconds`);
    }
  }

  return lastResponse;
});
