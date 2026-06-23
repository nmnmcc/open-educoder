import { Console, Effect, Option } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";

import { PracticeFilterChoices, PracticeLanguageChoices, ProblemFeature } from "../services/features/problem.js";
import { record, renderDetails, renderFields, renderListedCount, renderTable } from "./shared/output.js";
import { readStdinText } from "./shared/stdin.js";

const ProblemIdentifier = Argument.string("identifier").pipe(
  Argument.withDescription("Problem identifier shown by `problems list`, such as efjwgtb8."),
);
const Workspace = Argument.string("workspace").pipe(
  Argument.withDescription("Workspace identifier returned by `problems start`."),
);
const OptionalLogin = Flag.string("login").pipe(
  Flag.withDescription("Educoder login slug to use instead of the current user."),
  Flag.optional,
);
const Language = Flag.choice("language", PracticeLanguageChoices).pipe(
  Flag.withDescription("Source language: C, C++, Java, or Python."),
  Flag.withDefault("C++"),
  Flag.withAlias("g"),
);
const CodeContent = Flag.string("content").pipe(Flag.withDescription("Inline source code to upload."), Flag.optional);
const CodeStdin = Flag.boolean("stdin").pipe(Flag.withDescription("Read source code from standard input."));
const PositiveInteger = (name: string) =>
  Flag.integer(name).pipe(
    Flag.filter(
      (value) => value >= 1,
      (value) => `${name} must be greater than or equal to 1, got ${value}`,
    ),
  );
const Sources = Flag.integer("source").pipe(
  Flag.withDescription("Filter by source discipline ID from `problems sources`. Repeat to select multiple sources."),
  Flag.withAlias("s"),
  Flag.atLeast(0),
);

const printJson = (value: unknown) => Console.log(JSON.stringify(value, null, 2));

const optionalValue = <A>(value: Option.Option<A>): A | undefined => (Option.isSome(value) ? value.value : undefined);

const readCode = Effect.fn("problems.readCode")(function* (input: {
  readonly content: Option.Option<string>;
  readonly stdin: boolean;
}) {
  if (Option.isSome(input.content) && input.stdin) {
    return yield* Effect.fail("Use only one of --content or --stdin." as const);
  }

  if (Option.isSome(input.content)) {
    return input.content.value;
  }

  if (input.stdin) {
    return yield* readStdinText((message) => String(message));
  }

  return yield* Effect.fail("Provide source code with --content or --stdin." as const);
});

const renderProblemList = (view: unknown) => {
  const root = record(view);
  const problems = Object.entries(record(root["problems"])).map(([id, problemValue]) => ({
    id,
    problem: record(problemValue),
  }));

  return [
    "PROBLEMS",
    renderFields([["Total", root["total"]]]),
    "",
    renderTable(problems, [
      { header: "PROBLEM", value: (row) => row.id },
      { header: "DIFF", value: (row) => row.problem["difficulty"] },
      { header: "PASS", value: (row) => row.problem["passRatio"] },
      { header: "USERS", value: (row) => row.problem["userCount"] },
      { header: "STATUS", value: (row) => row.problem["status"] },
      { header: "TAGS", value: (row) => row.problem["tags"] },
      { header: "NAME", value: (row) => row.problem["name"] },
    ]),
    "",
    renderListedCount(problems.length, "problem"),
  ].join("\n");
};

const renderDisciplines = (view: unknown) => {
  const disciplines = Object.entries(record(record(view)["disciplines"])).map(([id, value]) => ({
    id,
    discipline: record(value),
  }));

  return [
    "DISCIPLINES",
    renderTable(disciplines, [
      { header: "ID", value: (row) => row.id },
      { header: "COUNT", value: (row) => row.discipline["count"] },
      { header: "NAME", value: (row) => row.discipline["name"] },
    ]),
    "",
    renderListedCount(disciplines.length, "discipline"),
  ].join("\n");
};

const List = Command.make(
  "list",
  {
    page: PositiveInteger("page").pipe(Flag.withDescription("Page number to fetch."), Flag.withDefault(1)),
    perPage: PositiveInteger("per-page").pipe(Flag.withDescription("Problems per page."), Flag.withDefault(30)),
    search: Flag.string("search").pipe(Flag.withDescription("Search problem names."), Flag.withDefault("")),
    filter: Flag.choice("filter", PracticeFilterChoices).pipe(
      Flag.withDescription("Problem visibility filter: public, mine, or all."),
      Flag.withDefault("public"),
    ),
    source: Sources,
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw problem list as JSON.")),
  },
  Effect.fn("problems.list")(function* (input) {
    const problemFeature = yield* ProblemFeature;
    const result = yield* problemFeature.list({
      page: input.page,
      perPage: input.perPage,
      search: input.search,
      filter: input.filter,
      sources: input.source.map((id) => String(id)),
      login: optionalValue(input.login),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    if (result.raw.practices_list.length === 0) {
      return yield* Console.log("No problems found.");
    }

    yield* Console.log(renderProblemList(result.view));
  }),
).pipe(
  Command.withDescription("List online judge problems with paging, search, and visibility filters."),
  Command.withExamples([
    { command: "open-educoder problems list", description: "List public problems" },
    { command: "open-educoder problems list --search 字符串 --per-page 50", description: "Search problems by name" },
    {
      command: "open-educoder problems list --source 2906 --source 2945",
      description: "Filter by multiple source disciplines (IDs from `problems sources`)",
    },
    { command: "open-educoder problems list --filter all --json", description: "List all problems as JSON" },
  ]),
  Command.withAlias("l"),
);

const Disciplines = Command.make(
  "disciplines",
  {
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw discipline list as JSON.")),
  },
  Effect.fn("problems.disciplines")(function* (input) {
    const problemFeature = yield* ProblemFeature;
    const result = yield* problemFeature.disciplines({
      login: optionalValue(input.login),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderDisciplines(result.view));
  }),
).pipe(
  Command.withDescription("List problem discipline tags and their problem counts."),
  Command.withExamples([{ command: "open-educoder problems disciplines", description: "List discipline tags" }]),
  Command.withAlias("d"),
);

const SourcesCommand = Command.make(
  "sources",
  {
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw source list as JSON.")),
  },
  Effect.fn("problems.sources")(function* (input) {
    const problemFeature = yield* ProblemFeature;
    const result = yield* problemFeature.disciplines({
      target: "practice_source",
      login: optionalValue(input.login),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderDisciplines(result.view));
  }),
).pipe(
  Command.withDescription(
    "List problem sources (题库) with their IDs and problem counts for use with `list --source`.",
  ),
  Command.withExamples([
    { command: "open-educoder problems sources", description: "List source disciplines and their IDs" },
  ]),
  Command.withAlias("o"),
);

const Start = Command.make(
  "start",
  {
    identifier: ProblemIdentifier,
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw start response as JSON.")),
  },
  Effect.fn("problems.start")(function* (input) {
    const problemFeature = yield* ProblemFeature;
    const result = yield* problemFeature.start({
      identifier: input.identifier,
      login: optionalValue(input.login),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderDetails("START", result.view));
  }),
).pipe(
  Command.withDescription("Start a problem attempt and resolve its workspace identifier for later commands."),
  Command.withExamples([
    { command: "open-educoder problems start efjwgtb8", description: "Start a problem and print the workspace id" },
  ]),
  Command.withAlias("S"),
);

const Info = Command.make(
  "info",
  {
    identifier: ProblemIdentifier,
    workspace: Flag.boolean("workspace").pipe(
      Flag.withDescription("Treat the argument as a workspace identifier (from `start`) instead of a problem ID."),
      Flag.withAlias("w"),
    ),
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw problem detail as JSON.")),
  },
  Effect.fn("problems.info")(function* (input) {
    const problemFeature = yield* ProblemFeature;
    const result = input.workspace
      ? yield* problemFeature.getInfo({
          workspace: input.identifier,
          login: optionalValue(input.login),
        })
      : yield* problemFeature.getInfoByProblem({
          identifier: input.identifier,
          login: optionalValue(input.login),
        });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderDetails("PROBLEM", result.view));
  }),
).pipe(
  Command.withDescription("Show a problem's statement, sample, limits, and your last saved code."),
  Command.withExamples([
    {
      command: "open-educoder problems info efjwgtb8",
      description: "Show problem detail by problem ID (auto-starts the attempt)",
    },
    {
      command: "open-educoder problems info mcjpgfx83l75 --workspace",
      description: "Show problem detail for an existing workspace without starting",
    },
  ]),
  Command.withAlias("i"),
);

const Code = Command.make(
  "code",
  {
    workspace: Workspace,
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw initial codes response as JSON.")),
  },
  Effect.fn("problems.code")(function* (input) {
    const problemFeature = yield* ProblemFeature;
    const result = yield* problemFeature.initialCodes({
      workspace: input.workspace,
      login: optionalValue(input.login),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderDetails("INITIAL CODES", result.view));
  }),
).pipe(
  Command.withDescription("Show the starter code templates for each language in a workspace."),
  Command.withExamples([
    { command: "open-educoder problems code mcjpgfx83l75", description: "Show starter code templates" },
  ]),
  Command.withAlias("c"),
);

const Debug = Command.make(
  "debug",
  {
    workspace: Workspace,
    input: Argument.string("input").pipe(Argument.withDescription("Standard input to feed the program.")),
    content: CodeContent,
    stdin: CodeStdin,
    language: Language,
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw debug result as JSON.")),
  },
  Effect.fn("problems.debug")(function* (input) {
    const code = yield* readCode({
      content: input.content,
      stdin: input.stdin,
    });
    const problemFeature = yield* ProblemFeature;
    const result = yield* problemFeature.debug({
      workspace: input.workspace,
      code,
      language: input.language,
      input: input.input,
      login: optionalValue(input.login),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderDetails("DEBUG RESULT", result.view));
  }),
).pipe(
  Command.withDescription("Save code then run a one-off debug evaluation against custom input."),
  Command.withExamples([
    {
      command: 'open-educoder problems debug mcjpgfx83l75 "3 1" --content "..." --language C++',
      description: "Debug inline code against custom input",
    },
    {
      command: 'cat main.cpp | open-educoder problems debug mcjpgfx83l75 "3 1" --stdin',
      description: "Debug code read from standard input",
    },
  ]),
  Command.withAlias("D"),
);

const Submit = Command.make(
  "submit",
  {
    workspace: Workspace,
    content: CodeContent,
    stdin: CodeStdin,
    language: Language,
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw submit result as JSON.")),
  },
  Effect.fn("problems.submit")(function* (input) {
    const code = yield* readCode({
      content: input.content,
      stdin: input.stdin,
    });
    const problemFeature = yield* ProblemFeature;
    const result = yield* problemFeature.submit({
      workspace: input.workspace,
      code,
      language: input.language,
      login: optionalValue(input.login),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderDetails("SUBMIT RESULT", result.view));
  }),
).pipe(
  Command.withDescription("Save code then submit it for official evaluation against all test cases."),
  Command.withExamples([
    {
      command: 'open-educoder problems submit mcjpgfx83l75 --content "..." --language C++',
      description: "Submit inline code for evaluation",
    },
    {
      command: "cat main.cpp | open-educoder problems submit mcjpgfx83l75 --stdin",
      description: "Submit code read from standard input",
    },
  ]),
  Command.withAlias("U"),
);

const Records = Command.make(
  "records",
  {
    workspace: Workspace,
    page: PositiveInteger("page").pipe(Flag.withDescription("Page number to fetch."), Flag.withDefault(1)),
    limit: PositiveInteger("limit").pipe(Flag.withDescription("Records per page."), Flag.withDefault(15)),
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw submit records as JSON.")),
  },
  Effect.fn("problems.records")(function* (input) {
    const problemFeature = yield* ProblemFeature;
    const result = yield* problemFeature.records({
      workspace: input.workspace,
      page: input.page,
      limit: input.limit,
      login: optionalValue(input.login),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderDetails("SUBMIT RECORDS", result.view));
  }),
).pipe(
  Command.withDescription("List your submission records for a problem workspace."),
  Command.withExamples([
    { command: "open-educoder problems records mcjpgfx83l75", description: "List submission records" },
  ]),
  Command.withAlias("r"),
);

export const Problems = Command.make("problems").pipe(
  Command.withDescription("List, start, debug, and submit online judge problems."),
  Command.withExamples([
    { command: "open-educoder problems list --search 字符串", description: "Search problems by name" },
    { command: "open-educoder problems start efjwgtb8", description: "Start a problem and get its workspace id" },
    {
      command: "cat main.cpp | open-educoder problems submit mcjpgfx83l75 --stdin --language C++",
      description: "Submit code for evaluation",
    },
  ]),
  Command.withAlias("p"),
  Command.withSubcommands([List, Disciplines, SourcesCommand, Start, Info, Code, Debug, Submit, Records]),
);
