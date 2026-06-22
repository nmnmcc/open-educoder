import { Buffer } from "node:buffer";

import { Context, Data, Effect, Layer } from "effect";

import { AppContext } from "../context/index.js";
import { EducoderApi } from "../educoder-api/index.js";
import { type EducoderApiResponse, type FeatureWorkflow } from "./shared.js";

export const PracticeFilterChoices = ["public", "mine", "all"] as const;
export const PracticeLanguageChoices = ["C", "C++", "Java", "Python"] as const;
export const DisciplineTargetChoices = ["practice", "practice_source"] as const;

export type PracticeFilter = (typeof PracticeFilterChoices)[number];
export type PracticeLanguage = (typeof PracticeLanguageChoices)[number];
export type DisciplineTarget = (typeof DisciplineTargetChoices)[number];

export class PracticeInputError extends Data.TaggedError("PracticeInputError")<{
  readonly message: string;
}> {}

const encodeCode = (value: string) => Buffer.from(value, "utf8").toString("base64");
const decodeCode = (value: string) => Buffer.from(value, "base64").toString("utf8");

const ResultEvaluating = 1 as const;
const ResultPollIntervalMs = "1 seconds" as const;
const ResultPollMaxAttempts = 60 as const;

type ListProblemsInput = {
  readonly page: number;
  readonly perPage: number;
  readonly search: string;
  readonly filter: PracticeFilter;
  readonly sources?: ReadonlyArray<string> | undefined;
  readonly login?: string | undefined;
};

type DisciplinesInput = {
  readonly target?: DisciplineTarget | undefined;
  readonly login?: string | undefined;
};

type StartInput = {
  readonly identifier: string;
  readonly login?: string | undefined;
};

type DetailInput = {
  readonly workspace: string;
  readonly login?: string | undefined;
};

type DetailByProblemInput = {
  readonly identifier: string;
  readonly login?: string | undefined;
};

type InitialCodesInput = {
  readonly workspace: string;
  readonly login?: string | undefined;
};

type SaveCodeInput = {
  readonly workspace: string;
  readonly code: string;
  readonly language: PracticeLanguage;
  readonly login?: string | undefined;
};

type DebugInput = {
  readonly workspace: string;
  readonly code: string;
  readonly language: PracticeLanguage;
  readonly input: string;
  readonly login?: string | undefined;
};

type SubmitInput = {
  readonly workspace: string;
  readonly code: string;
  readonly language: PracticeLanguage;
  readonly login?: string | undefined;
};

type RecordsInput = {
  readonly workspace: string;
  readonly page: number;
  readonly limit: number;
  readonly login?: string | undefined;
};

type ListProblemsRaw = EducoderApiResponse<"Practice", "list">;
type DisciplinesRaw = EducoderApiResponse<"Practice", "disciplines">;
type StartRaw = EducoderApiResponse<"Practice", "start">;
type DetailRaw = EducoderApiResponse<"Practice", "detail">;
type InitialCodesRaw = EducoderApiResponse<"Practice", "initialCodes">;
type ResultRaw = EducoderApiResponse<"Practice", "result">;
type RecordsRaw = EducoderApiResponse<"Practice", "submitRecords">;

type DebugRaw = {
  readonly debug: EducoderApiResponse<"Practice", "codeDebug">;
  readonly result: ResultRaw;
};

type SubmitRaw = {
  readonly submit: EducoderApiResponse<"Practice", "codeSubmit">;
  readonly result: ResultRaw;
};

type ListProblemsView = {
  readonly total: number;
  readonly problems: Record<
    string,
    {
      readonly name: string;
      readonly difficulty: number;
      readonly passRatio: string | null;
      readonly userCount: number | null;
      readonly solutionCount: number | null;
      readonly tags: string;
      readonly status: string | null;
      readonly creator: string | null;
      readonly updated: string | null;
    }
  >;
};

type DisciplinesView = {
  readonly disciplines: Record<
    number,
    {
      readonly name: string;
      readonly count: number | null;
    }
  >;
};

type StartView = {
  readonly workspace: string;
  readonly status: number;
  readonly message: string;
};

type DetailView = {
  readonly problem: {
    readonly id: number;
    readonly name: string;
    readonly identifier: string;
    readonly difficulty: number | null;
    readonly timeLimit: number | null;
    readonly language: string | null;
    readonly description: string | null;
    readonly passed: boolean | null;
    readonly passCount: number | null;
    readonly submitCount: number | null;
    readonly testCaseSize: number | null;
    readonly author: string | null;
  };
  readonly sample: {
    readonly input: string | null;
    readonly isFile: boolean | null;
  };
  readonly code: string | null;
};

type InitialCodesView = {
  readonly codes: Record<string, string>;
};

type EvaluationView = {
  readonly evaluation: {
    readonly status: number;
    readonly message: string;
    readonly passed: boolean | null;
    readonly input: string | null;
    readonly output: string | null;
    readonly expectedOutput: string | null;
    readonly errorLine: number | null;
    readonly errorMessage: string | null;
    readonly executeTime: number | null;
    readonly executeMemory: number | null;
    readonly timeBetterThan: number | null;
    readonly memoryBetterThan: number | null;
  };
};

type RecordsView = {
  readonly total: number;
  readonly records: Record<
    number,
    {
      readonly status: number | null;
      readonly language: string | null;
      readonly executeTime: number | null;
      readonly executeMemory: number | null;
      readonly created: string | null;
    }
  >;
};

const filterToQuery = (filter: PracticeFilter) => filter;

const formatTags = (tags: ReadonlyArray<string> | null | undefined) => (tags ?? []).join(", ");

const PracticeStatusLabels: Record<number, string> = {
  0: "not started",
  1: "in progress",
  2: "passed",
};

const formatPracticeStatus = (status: number | null | undefined) =>
  status === null || status === undefined ? null : (PracticeStatusLabels[status] ?? String(status));

const formatResultView = (result: ResultRaw): EvaluationView => {
  const data = result.data ?? null;

  return {
    evaluation: {
      status: result.status,
      message: result.message,
      passed: data?.passed ?? null,
      input: data?.input ?? null,
      output: data?.output ?? null,
      expectedOutput: data?.expected_output ?? null,
      errorLine: data?.error_line ?? null,
      errorMessage: data?.error_msg ?? null,
      executeTime: data?.execute_time ?? null,
      executeMemory: data?.execute_memory ?? null,
      timeBetterThan: data?.time_better_than ?? null,
      memoryBetterThan: data?.memory_better_than ?? null,
    },
  };
};

export type ProblemFeatureShape = {
  readonly list: FeatureWorkflow<ListProblemsInput, ListProblemsRaw, ListProblemsView>;
  readonly disciplines: FeatureWorkflow<DisciplinesInput, DisciplinesRaw, DisciplinesView>;
  readonly start: FeatureWorkflow<StartInput, StartRaw, StartView>;
  readonly getInfo: FeatureWorkflow<DetailInput, DetailRaw, DetailView>;
  readonly getInfoByProblem: FeatureWorkflow<DetailByProblemInput, DetailRaw, DetailView>;
  readonly initialCodes: FeatureWorkflow<InitialCodesInput, InitialCodesRaw, InitialCodesView>;
  readonly saveCode: FeatureWorkflow<SaveCodeInput, EducoderApiResponse<"Practice", "updateCode">, StartView>;
  readonly debug: FeatureWorkflow<DebugInput, DebugRaw, EvaluationView>;
  readonly submit: FeatureWorkflow<SubmitInput, SubmitRaw, EvaluationView>;
  readonly records: FeatureWorkflow<RecordsInput, RecordsRaw, RecordsView>;
};

export class ProblemFeature extends Context.Service<ProblemFeature, ProblemFeatureShape>()(
  "open-educoder/services/features/ProblemFeature",
) {
  public static readonly layer = Layer.effect(
    ProblemFeature,
    Effect.gen(function* () {
      const ctx = yield* AppContext;
      const educoder = yield* EducoderApi;

      const resolveLogin = Effect.fn("features.problem.resolveLogin")(function* (login?: string | undefined) {
        if (login !== undefined) {
          return login;
        }

        const user = yield* ctx.user;

        return user.login;
      });

      const saveCodeRequest = (workspace: string, login: string, code: string, language: PracticeLanguage) =>
        educoder.Practice.updateCode({
          params: {
            identifier: workspace,
          },
          query: {
            zzud: login,
          },
          payload: {
            code: encodeCode(code),
            language,
          },
        });

      const pollResult = Effect.fn("features.problem.pollResult")(function* (
        workspace: string,
        login: string,
        mode: "debug" | "submit",
      ) {
        const fetchResult = educoder.Practice.result({
          params: {
            identifier: workspace,
          },
          query: {
            mode,
            zzud: login,
          },
        });

        let result = yield* fetchResult;

        for (let attempt = 1; attempt < ResultPollMaxAttempts && result.status === ResultEvaluating; attempt += 1) {
          yield* Effect.sleep(ResultPollIntervalMs);
          result = yield* fetchResult;
        }

        return result;
      });

      const list: ProblemFeatureShape["list"] = Effect.fn("features.problem.list")(function* (input) {
        const login = yield* resolveLogin(input.login);
        const sources = input.sources ?? [];
        const raw = yield* educoder.Practice.list({
          query: {
            page: input.page,
            per_page: input.perPage,
            search: input.search,
            save_search: "",
            filter: filterToQuery(input.filter),
            ...(sources.length >= 1 ? { "source_discipline_id[]": sources } : {}),
            zzud: login,
          },
        });

        return {
          raw,
          view: {
            total: raw.practices_count,
            problems: Object.fromEntries(
              raw.practices_list.map((problem) => [
                problem.identifier,
                {
                  name: problem.name,
                  difficulty: problem.difficulty,
                  passRatio: problem.pass_ratio ?? null,
                  userCount: problem.user_count ?? null,
                  solutionCount: problem.solution_count ?? null,
                  tags: formatTags(problem.tag_disciplines_name),
                  status: formatPracticeStatus(problem.status),
                  creator: problem.creator ?? null,
                  updated: problem.updated_at ?? null,
                },
              ]),
            ),
          },
        };
      });

      const disciplines: ProblemFeatureShape["disciplines"] = Effect.fn("features.problem.disciplines")(
        function* (input) {
          const login = yield* resolveLogin(input.login);
          const raw = yield* educoder.Practice.disciplines({
            query: {
              target: input.target ?? "practice",
              position: "index",
              zzud: login,
            },
          });

          return {
            raw,
            view: {
              disciplines: Object.fromEntries(
                raw.tag_disciplines.map((discipline) => [
                  discipline.id,
                  {
                    name: discipline.name,
                    count: discipline.count ?? null,
                  },
                ]),
              ),
            },
          };
        },
      );

      const start: ProblemFeatureShape["start"] = Effect.fn("features.problem.start")(function* (input) {
        const login = yield* resolveLogin(input.login);
        const raw = yield* educoder.Practice.start({
          params: {
            identifier: input.identifier,
          },
          query: {
            zzud: login,
          },
        });

        return {
          raw,
          view: {
            workspace: raw.identifier,
            status: raw.status,
            message: raw.message,
          },
        };
      });

      const getInfo: ProblemFeatureShape["getInfo"] = Effect.fn("features.problem.getInfo")(function* (input) {
        const login = yield* resolveLogin(input.login);
        const raw = yield* educoder.Practice.detail({
          params: {
            identifier: input.workspace,
          },
          query: {
            hidePopLogin: "true",
            zzud: login,
          },
        });
        const code = raw.practice.code;

        return {
          raw,
          view: {
            problem: {
              id: raw.practice.id,
              name: raw.practice.name,
              identifier: raw.practice.identifier,
              difficulty: raw.practice.difficulty ?? null,
              timeLimit: raw.practice.time_limit ?? null,
              language: raw.practice.language ?? null,
              description: raw.practice.description ?? null,
              passed: raw.practice.passed ?? null,
              passCount: raw.practice.pass_count ?? null,
              submitCount: raw.practice.submit_count ?? null,
              testCaseSize: raw.practice.test_case_size ?? null,
              author: raw.practice.username ?? null,
            },
            sample: {
              input: raw.test_case?.input ?? null,
              isFile: raw.test_case?.is_file ?? null,
            },
            code: code === null || code === undefined || code === "" ? null : decodeCode(code),
          },
        };
      });

      const getInfoByProblem: ProblemFeatureShape["getInfoByProblem"] = Effect.fn("features.problem.getInfoByProblem")(
        function* (input) {
          const started = yield* start({
            identifier: input.identifier,
            ...(input.login !== undefined ? { login: input.login } : {}),
          });

          return yield* getInfo({
            workspace: started.view.workspace,
            ...(input.login !== undefined ? { login: input.login } : {}),
          });
        },
      );

      const initialCodes: ProblemFeatureShape["initialCodes"] = Effect.fn("features.problem.initialCodes")(
        function* (input) {
          const login = yield* resolveLogin(input.login);
          const raw = yield* educoder.Practice.initialCodes({
            params: {
              identifier: input.workspace,
            },
            query: {
              zzud: login,
            },
          });

          return {
            raw,
            view: {
              codes: Object.fromEntries((raw.data ?? []).map((entry) => [entry.language, decodeCode(entry.code)])),
            },
          };
        },
      );

      const saveCode: ProblemFeatureShape["saveCode"] = Effect.fn("features.problem.saveCode")(function* (input) {
        const login = yield* resolveLogin(input.login);
        const raw = yield* saveCodeRequest(input.workspace, login, input.code, input.language);

        return {
          raw,
          view: {
            workspace: input.workspace,
            status: raw.status,
            message: raw.message,
          },
        };
      });

      const debug: ProblemFeatureShape["debug"] = Effect.fn("features.problem.debug")(function* (input) {
        if (input.input.length < 1) {
          return yield* new PracticeInputError({
            message: "Provide debug input with --input.",
          });
        }

        const login = yield* resolveLogin(input.login);
        yield* saveCodeRequest(input.workspace, login, input.code, input.language);
        const debugResponse = yield* educoder.Practice.codeDebug({
          params: {
            identifier: input.workspace,
          },
          query: {
            zzud: login,
          },
          payload: {
            input: input.input,
          },
        });
        const result = yield* pollResult(input.workspace, login, "debug");

        return {
          raw: {
            debug: debugResponse,
            result,
          },
          view: formatResultView(result),
        };
      });

      const submit: ProblemFeatureShape["submit"] = Effect.fn("features.problem.submit")(function* (input) {
        const login = yield* resolveLogin(input.login);
        yield* saveCodeRequest(input.workspace, login, input.code, input.language);
        const submitResponse = yield* educoder.Practice.codeSubmit({
          params: {
            identifier: input.workspace,
          },
          query: {
            zzud: login,
          },
          payload: {},
        });
        const result = yield* pollResult(input.workspace, login, "submit");

        return {
          raw: {
            submit: submitResponse,
            result,
          },
          view: formatResultView(result),
        };
      });

      const records: ProblemFeatureShape["records"] = Effect.fn("features.problem.records")(function* (input) {
        const login = yield* resolveLogin(input.login);
        const raw = yield* educoder.Practice.submitRecords({
          params: {
            identifier: input.workspace,
          },
          query: {
            limit: input.limit,
            page: input.page,
            zzud: login,
          },
        });

        return {
          raw,
          view: {
            total: raw.records_count ?? raw.records.length,
            records: Object.fromEntries(
              raw.records.map((record) => [
                record.id,
                {
                  status: record.status ?? null,
                  language: record.language ?? null,
                  executeTime: record.execute_time ?? null,
                  executeMemory: record.execute_memory ?? null,
                  created: record.created_at ?? null,
                },
              ]),
            ),
          },
        };
      });

      return ProblemFeature.of({
        list,
        disciplines,
        start,
        getInfo,
        getInfoByProblem,
        initialCodes,
        saveCode,
        debug,
        submit,
        records,
      });
    }),
  );
}
