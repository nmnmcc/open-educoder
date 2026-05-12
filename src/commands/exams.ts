import { Console, Effect, Option } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";

import { ExamFeature } from "../services/features/exam.js";
import { inspectOptions } from "../utils/inspect-options.js";

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

    yield* Console.dir(result.view, inspectOptions);
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
  },
  Effect.fn("exam.info")(function* (input) {
    const examFeature = yield* ExamFeature;
    const result = yield* examFeature.getInfo({
      courseId: input.courseId,
      examId: input.examId,
      login: optionalValue(input.login),
    });

    yield* printJson(result.raw);
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
  },
  Effect.fn("exam.start")(function* (input) {
    const examFeature = yield* ExamFeature;
    const result = yield* examFeature.start({
      courseId: input.courseId,
      examId: input.examId,
      login: optionalValue(input.login),
    });

    yield* printJson(result.raw);
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

    yield* Console.dir(
      {
        questions: Object.fromEntries(
          result.view.questions.map((question) => [
            question.number,
            {
              id: question.id,
              type: question.type,
              score: question.score,
              choices: question.choices,
              title: question.title,
            },
          ]),
        ),
      },
      inspectOptions,
    );
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

    yield* Console.dir(result.view, inspectOptions);
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
  },
  Effect.fn("exam.answer.single")(function* (input) {
    const examFeature = yield* ExamFeature;
    const result = yield* examFeature.answer({
      questionId: input.questionId,
      exerciseChoiceId: input.choiceId,
      answerText: null,
      login: optionalValue(input.login),
    });

    yield* printJson(result.raw);
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

    yield* printJson(result.raw);
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
    text: Argument.string("text").pipe(Argument.withDescription("Answer text to save for the question.")),
    login: OptionalLogin,
  },
  Effect.fn("exam.answer.text")(function* (input) {
    const examFeature = yield* ExamFeature;
    const result = yield* examFeature.answer({
      questionId: input.questionId,
      exerciseChoiceId: 1,
      answerText: input.text,
      login: optionalValue(input.login),
    });

    yield* printJson(result.raw);
  }),
).pipe(
  Command.withDescription("Save one free-text answer for a question."),
  Command.withExamples([
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
