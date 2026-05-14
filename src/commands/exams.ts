import { Console, Effect, Option } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";

import { AnswerInputError, ExamFeature } from "../services/features/exam.js";
import {
  array,
  formatValue,
  record,
  renderDetails,
  renderFields,
  renderListedCount,
  renderTable,
} from "./shared/output.js";
import { readStdinText } from "./shared/stdin.js";

const CourseId = Argument.string("course-id").pipe(
  Argument.withDescription("Course ID shown by `courses list`, such as MOAPGNLO."),
);
const ExamId = Argument.integer("exam-id").pipe(Argument.withDescription("Exam ID shown by `exams list`."));
const QuestionId = Argument.integer("question-id").pipe(Argument.withDescription("Question ID shown by `exams show`."));
const OptionalLogin = Flag.string("login").pipe(
  Flag.withDescription("Educoder login slug to use instead of the current user."),
  Flag.optional,
);
const WithChoiceContent = Flag.boolean("with-choice-content").pipe(
  Flag.withDescription("Include full choice text when showing questions."),
  Flag.withAlias("c"),
);
const PositiveInteger = (name: string) =>
  Flag.integer(name).pipe(
    Flag.filter(
      (value) => value >= 1,
      (value) => `${name} must be greater than or equal to 1, got ${value}`,
    ),
  );

const printJson = (value: unknown) => Console.log(JSON.stringify(value, null, 2));

const optionalValue = <A>(value: Option.Option<A>): A | undefined => (Option.isSome(value) ? value.value : undefined);

const indentBlock = (value: string, indent = 2) =>
  value
    .split("\n")
    .map((line) => `${" ".repeat(indent)}${line}`)
    .join("\n");

const renderExamList = (view: unknown) => {
  const root = record(view);
  const exams = Object.entries(record(root["exams"])).map(([id, examValue]) => ({
    id,
    exam: record(examValue),
  }));

  return [
    "EXAMS",
    renderFields([["Total", root["total"]]]),
    "",
    renderTable(exams, [
      { header: "EXAM", value: (row) => row.id },
      { header: "CURRENT", value: (row) => row.exam["currentStatus"] },
      { header: "EXERCISE", value: (row) => row.exam["exerciseStatus"] },
      { header: "WHOLE", value: (row) => row.exam["wholeStatus"] },
      { header: "TIME", value: (row) => row.exam["time"] },
      { header: "LEFT", value: (row) => row.exam["leftTime"] },
      { header: "LOCKED", value: (row) => row.exam["locked"] },
      { header: "RANDOM", value: (row) => row.exam["random"] },
      { header: "SCREEN", value: (row) => row.exam["screenOpen"] },
      { header: "USER", value: (row) => row.exam["exerciseUserId"] },
      { header: "NAME", value: (row) => row.exam["name"] },
    ]),
    "",
    renderListedCount(exams.length, "exam"),
  ].join("\n");
};

const renderExamInfo = (value: unknown) => {
  const root = record(value);
  const data = record(root["data"]);

  return [
    "EXAM USER INFO",
    renderFields([
      ["Status", root["status"]],
      ["Message", root["message"]],
      ["Can Start", data["can_start"]],
      ["Committed", data["is_commit"]],
      ["Locked", data["is_locked"]],
      ["User Locked", data["is_user_locked"]],
      ["Start Locked", data["start_locked"]],
      ["Answered Open", data["answered_open"]],
      ["Score Open", data["open_score"]],
      ["Total Score Open", data["open_total_score"]],
      ["Screen", data["screen_open"]],
      ["Screens Used", `${formatValue(data["used_screen_num"])}/${formatValue(data["screen_num"])}`],
      ["Screen Seconds", data["screen_sec"]],
      ["IP Limit", data["ip_limit"]],
      ["Last IP", data["last_ip"]],
      ["Exercise User", data["exercise_user_id"]],
      ["Exercise Type", data["exercise_type"]],
    ]),
  ].join("\n");
};

const renderExamStart = (value: unknown) => {
  const root = record(value);
  const exercise = record(root["exercise"]);
  const questionTypes = array(root["exercise_question_types"]).map((item) => record(item));
  const questionCount = questionTypes.reduce((count, item) => count + array(item["items"]).length, 0);

  return [
    "EXAM SESSION",
    renderFields([
      ["Exam", exercise["id"]],
      ["Name", exercise["exercise_name"]],
      ["Banner", root["left_banner_name"]],
      ["Time", exercise["time"]],
      ["Left", exercise["left_time"]],
      ["User", exercise["user_name"]],
      ["Student", exercise["student_id"]],
      ["Random", exercise["is_random"]],
      ["Screen", exercise["screen_open"]],
      ["Screens Used", `${formatValue(exercise["used_screen_num"])}/${formatValue(exercise["screen_num"])}`],
      ["Commit Status", exercise["commit_status"]],
      ["Can Start", exercise["can_start"]],
      ["Questions", questionCount],
    ]),
  ].join("\n");
};

const choiceSummary = (choicesValue: unknown) => {
  const choices = Object.entries(record(choicesValue));
  const selected = choices
    .filter(([, choiceValue]) => record(choiceValue)["selected"] === true)
    .map(([position, choiceValue]) => `${position}:${formatValue(record(choiceValue)["id"])}`);

  return selected.length >= 1 ? selected.join(", ") : "-";
};

const renderExamQuestions = (view: unknown) => {
  const questions = array(record(view)["questions"]).map((question) => record(question));
  const lines = [
    "EXAM QUESTIONS",
    renderTable(questions, [
      { header: "NO", value: (row) => row["number"] },
      { header: "QUESTION", value: (row) => row["id"] },
      { header: "TYPE", value: (row) => row["type"] },
      { header: "SCORE", value: (row) => row["score"] },
      { header: "SELECTED", value: (row) => choiceSummary(row["choices"]) },
      { header: "TITLE", value: (row) => row["title"] },
    ]),
    "",
    renderListedCount(questions.length, "question"),
  ];

  for (const question of questions) {
    const choices = Object.entries(record(question["choices"])).map(([position, choiceValue]) => ({
      position,
      choice: record(choiceValue),
    }));

    if (!choices.some((choice) => typeof choice.choice["text"] === "string")) {
      continue;
    }

    lines.push(
      "",
      `[${formatValue(question["number"])}] ${formatValue(question["title"])}`,
      indentBlock(
        renderTable(choices, [
          { header: "POS", value: (row) => row.position },
          { header: "CHOICE", value: (row) => row.choice["id"] },
          { header: "SELECTED", value: (row) => row.choice["selected"] },
          { header: "TEXT", value: (row) => row.choice["text"] },
        ]),
      ),
    );
  }

  return lines.join("\n").trimEnd();
};

const renderExamSubmit = (view: unknown) => renderDetails("EXAM SUBMIT", view);

const renderAnswerResponse = (questionId: number, value: unknown) => {
  const root = record(value);

  return [
    "EXAM ANSWER",
    renderFields([
      ["Question", questionId],
      ["Status", root["status"]],
      ["Message", root["message"]],
    ]),
  ].join("\n");
};

const readAnswerText = Effect.fn("exam.answer.readText")(function* (input: {
  readonly text: Option.Option<string>;
  readonly stdin: boolean;
}) {
  if (Option.isSome(input.text) && input.stdin) {
    return yield* new AnswerInputError({
      message: "Use either a text argument or --stdin, not both.",
    });
  }

  if (Option.isSome(input.text)) {
    return input.text.value;
  }

  if (input.stdin) {
    return yield* readStdinText((message) => new AnswerInputError({ message: String(message) }));
  }

  return yield* new AnswerInputError({
    message: "Provide answer text as an argument or --stdin.",
  });
});

const List = Command.make(
  "list",
  {
    courseId: CourseId,
    page: PositiveInteger("page").pipe(Flag.withDescription("Page number to fetch."), Flag.withDefault(1)),
    limit: PositiveInteger("limit").pipe(Flag.withDescription("Exams per page."), Flag.withDefault(20)),
    type: Flag.string("type").pipe(Flag.withDescription("Optional Educoder exam type filter."), Flag.withDefault("")),
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw exam list as JSON.")),
  },
  Effect.fn("exam.list")(function* (input) {
    const examFeature = yield* ExamFeature;
    const result = yield* examFeature.list({
      courseId: input.courseId,
      page: input.page,
      limit: input.limit,
      type: input.type,
      login: optionalValue(input.login),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    if (result.raw.exercises.length === 0) {
      return yield* Console.log("No exams found.");
    }

    yield* Console.log(renderExamList(result.view));
  }),
).pipe(
  Command.withDescription("List exams in a course and show the exam IDs needed by other exam commands."),
  Command.withExamples([
    { command: "open-educoder exams list MOAPGNLO", description: "List exams by course ID" },
    {
      command: "open-educoder exams list MOAPGNLO --page 1 --limit 20 --json",
      description: "Print the exam list in JSON",
    },
  ]),
  Command.withAlias("l"),
);

const Info = Command.make(
  "info",
  {
    courseId: CourseId,
    examId: ExamId,
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw exam user info as JSON.")),
  },
  Effect.fn("exam.info")(function* (input) {
    const examFeature = yield* ExamFeature;
    const result = yield* examFeature.getInfo({
      courseId: input.courseId,
      examId: input.examId,
      login: optionalValue(input.login),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderExamInfo(result.raw));
  }),
).pipe(
  Command.withDescription("Show your current exam session state before starting or resuming."),
  Command.withExamples([
    { command: "open-educoder exams info MOAPGNLO 198085", description: "Inspect exam user info" },
    {
      command: "open-educoder exams info MOAPGNLO 198085 --login pl2kfhv6g",
      description: "Inspect using a specific login token",
    },
  ]),
  Command.withAlias("i"),
);

const Start = Command.make(
  "start",
  {
    courseId: CourseId,
    examId: ExamId,
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw exam start response as JSON.")),
  },
  Effect.fn("exam.start")(function* (input) {
    const examFeature = yield* ExamFeature;
    const result = yield* examFeature.start({
      courseId: input.courseId,
      examId: input.examId,
      login: optionalValue(input.login),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderExamStart(result.raw));
  }),
).pipe(
  Command.withDescription("Start an exam attempt or resume the existing attempt."),
  Command.withExamples([
    { command: "open-educoder exams start MOAPGNLO 198085", description: "Start or resume an exam" },
    {
      command: "open-educoder exams start MOAPGNLO 198085 --login pl2kfhv6g",
      description: "Start with an explicit login token",
    },
  ]),
  Command.withAlias("S"),
);

const Show = Command.make(
  "show",
  {
    courseId: CourseId,
    examId: ExamId,
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print questions and answer state as JSON.")),
    withChoiceContent: WithChoiceContent,
  },
  Effect.fn("exam.show")(function* (input) {
    const examFeature = yield* ExamFeature;
    const result = yield* examFeature.show({
      courseId: input.courseId,
      examId: input.examId,
      login: optionalValue(input.login),
      withChoiceContent: input.withChoiceContent,
    });

    if (input.json) {
      return yield* printJson(result.view);
    }

    if (result.view.questions.length === 0) {
      return yield* Console.log("No questions found.");
    }

    yield* Console.log(renderExamQuestions(result.view));
  }),
).pipe(
  Command.withDescription("Show question IDs, question types, scores, choices, and current selections."),
  Command.withExamples([
    {
      command: "open-educoder exams show MOAPGNLO 198085",
      description: "Show question IDs and current answers",
    },
    {
      command: "open-educoder exams show MOAPGNLO 198085 --with-choice-content",
      description: "Include full choice text in the output",
    },
  ]),
  Command.withAlias("H"),
);

const Submit = Command.make(
  "submit",
  {
    courseId: CourseId,
    examId: ExamId,
    login: OptionalLogin,
    commitMethod: PositiveInteger("commit-method").pipe(
      Flag.withDescription("Educoder submit method code."),
      Flag.withDefault(1),
    ),
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw submit response as JSON.")),
  },
  Effect.fn("exam.submit")(function* (input) {
    const examFeature = yield* ExamFeature;
    const result = yield* examFeature.submit({
      courseId: input.courseId,
      examId: input.examId,
      login: optionalValue(input.login),
      commitMethod: input.commitMethod,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderExamSubmit(result.view));
  }),
).pipe(
  Command.withDescription("Submit the current exam attempt with the saved answers."),
  Command.withExamples([
    {
      command: "open-educoder exams submit MOAPGNLO 198085",
      description: "Submit with default commit method",
    },
    {
      command: "open-educoder exams submit MOAPGNLO 198085 --commit-method 1 --json",
      description: "Submit and print submit-state response as JSON",
    },
  ]),
  Command.withAlias("U"),
);

const Single = Command.make(
  "single",
  {
    questionId: QuestionId,
    choiceId: Argument.integer("choice-id").pipe(Argument.withDescription("Choice ID shown by `exams show`.")),
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw answer response as JSON.")),
  },
  Effect.fn("exam.answer.single")(function* (input) {
    const examFeature = yield* ExamFeature;
    const result = yield* examFeature.answer({
      questionId: input.questionId,
      exerciseChoiceId: input.choiceId,
      answerText: null,
      login: optionalValue(input.login),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderAnswerResponse(input.questionId, result.raw));
  }),
).pipe(
  Command.withDescription("Save one single-choice answer using a question ID and one choice ID."),
  Command.withExamples([
    {
      command: "open-educoder exams answer single 12263457 35397429",
      description: "Save one selected choice",
    },
  ]),
  Command.withAlias("S"),
);

const Multiple = Command.make(
  "multiple",
  {
    questionId: QuestionId,
    choiceIds: Argument.string("choice-ids").pipe(
      Argument.withDescription("Comma-separated choice IDs shown by `exams show`."),
    ),
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw answer response as JSON.")),
  },
  Effect.fn("exam.answer.multiple")(function* (input) {
    const examFeature = yield* ExamFeature;
    const choiceIds = yield* examFeature.parseChoiceIds(input.choiceIds);

    const result = yield* examFeature.answer({
      questionId: input.questionId,
      exerciseChoiceId: choiceIds,
      answerText: null,
      login: optionalValue(input.login),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderAnswerResponse(input.questionId, result.raw));
  }),
).pipe(
  Command.withDescription("Save one multiple-choice answer using comma-separated choice IDs."),
  Command.withExamples([
    {
      command: "open-educoder exams answer multiple 12263483 35397470,35397469",
      description: "Save several selected choices",
    },
  ]),
  Command.withAlias("M"),
);

const Text = Command.make(
  "text",
  {
    questionId: QuestionId,
    text: Argument.string("text").pipe(
      Argument.withDescription("Answer text to save for the question."),
      Argument.optional,
    ),
    stdin: Flag.boolean("stdin").pipe(Flag.withDescription("Read answer text from standard input.")),
    login: OptionalLogin,
    json: Flag.boolean("json").pipe(Flag.withDescription("Print the raw answer response as JSON.")),
  },
  Effect.fn("exam.answer.text")(function* (input) {
    const answerText = yield* readAnswerText({
      text: input.text,
      stdin: input.stdin,
    });
    const examFeature = yield* ExamFeature;
    const result = yield* examFeature.answer({
      questionId: input.questionId,
      exerciseChoiceId: 1,
      answerText,
      login: optionalValue(input.login),
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderAnswerResponse(input.questionId, result.raw));
  }),
).pipe(
  Command.withDescription("Save one free-text answer for a question."),
  Command.withExamples([
    {
      command: "cat answer.md | open-educoder exams answer text 12263490 --stdin",
      description: "Save text answer read from standard input",
    },
    {
      command: 'open-educoder exams answer text 12263490 "12"',
      description: "Save text answer",
    },
  ]),
  Command.withAlias("T"),
);

const Answer = Command.make("answer").pipe(
  Command.withDescription("Save one exam answer; choose single, multiple, or text by question type."),
  Command.withExamples([
    { command: "open-educoder exams answer single 12263457 35397429", description: "Save a single-choice answer" },
    {
      command: "open-educoder exams answer multiple 12263483 35397470,35397469",
      description: "Save a multiple-choice answer",
    },
    { command: "cat answer.md | open-educoder exams answer text 12263490 --stdin", description: "Save a text answer" },
    { command: 'open-educoder exams answer text 12263490 "12"', description: "Save a text answer" },
  ]),
  Command.withAlias("A"),
  Command.withSubcommands([Single, Multiple, Text]),
);

export const Exams = Command.make("exams").pipe(
  Command.withDescription("List exams, start attempts, show questions, save answers, and submit."),
  Command.withExamples([
    { command: "open-educoder exams list MOAPGNLO", description: "List exams for a course" },
    {
      command: "open-educoder exams show MOAPGNLO 198085 --with-choice-content",
      description: "Display exam questions and selected choices",
    },
    { command: "open-educoder exams answer single 12263457 35397429", description: "Save a single-choice answer" },
    { command: "open-educoder exams submit MOAPGNLO 198085", description: "Submit an exam attempt" },
  ]),
  Command.withAlias("e"),
  Command.withSubcommands([List, Info, Start, Show, Submit, Answer]),
);
