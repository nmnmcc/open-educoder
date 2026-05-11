import { Console, Effect, Option } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";
import { ExamFeature } from "../services/features/exam.js";
import { inspectOptions } from "../utils/inspect-options.js";

const OptionalLogin = Flag.string("login").pipe(Flag.optional);
const WithChoiceContent = Flag.boolean("with-choice-content").pipe(Flag.withAlias("c"));
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
    courseId: Argument.string("course-id"),
    page: PositiveInteger("page").pipe(Flag.withDefault(1)),
    limit: PositiveInteger("limit").pipe(Flag.withDefault(20)),
    type: Flag.string("type").pipe(Flag.withDefault("")),
    login: OptionalLogin,
    json: Flag.boolean("json"),
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
  Command.withDescription("List exams for a course."),
  Command.withExamples([
    { command: "open-educoder exam list MOAPGNLO", description: "List exams by course ID" },
    {
      command: "open-educoder exam list MOAPGNLO --page 1 --limit 20 --json",
      description: "Print exam list as JSON",
    },
  ]),
  Command.withAlias("l"),
);

const Info = Command.make(
  "info",
  {
    courseId: Argument.string("course-id"),
    examId: Argument.integer("exam-id"),
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
  Command.withDescription("Fetch raw exam user information before or during an exam."),
  Command.withExamples([
    { command: "open-educoder exam info MOAPGNLO 198085", description: "Inspect exam user info" },
    {
      command: "open-educoder exam info MOAPGNLO 198085 --login pl2kfhv6g",
      description: "Inspect as an explicit login",
    },
  ]),
  Command.withAlias("i"),
);

const Start = Command.make(
  "start",
  {
    courseId: Argument.string("course-id"),
    examId: Argument.integer("exam-id"),
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
  Command.withDescription("Start or resume an Educoder exam attempt and print the raw response."),
  Command.withExamples([
    { command: "open-educoder exam start MOAPGNLO 198085", description: "Start or resume an exam" },
    {
      command: "open-educoder exam start MOAPGNLO 198085 --login pl2kfhv6g",
      description: "Start with an explicit login",
    },
  ]),
  Command.withAlias("S"),
);

const Show = Command.make(
  "show",
  {
    courseId: Argument.string("course-id"),
    examId: Argument.integer("exam-id"),
    login: OptionalLogin,
    json: Flag.boolean("json"),
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
  Command.withDescription("Start or resume an exam and render its questions in a compact shape."),
  Command.withExamples([
    { command: "open-educoder exam show MOAPGNLO 198085", description: "Show question IDs and selected choices" },
    {
      command: "open-educoder exam show MOAPGNLO 198085 --with-choice-content",
      description: "Include choice text in the question list",
    },
  ]),
  Command.withAlias("H"),
);

const Submit = Command.make(
  "submit",
  {
    courseId: Argument.string("course-id"),
    examId: Argument.integer("exam-id"),
    login: OptionalLogin,
    commitMethod: PositiveInteger("commit-method").pipe(Flag.withDefault(1)),
    json: Flag.boolean("json"),
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
  Command.withDescription("Submit an exam attempt after checking remaining time and unanswered counts."),
  Command.withExamples([
    {
      command: "open-educoder exam submit MOAPGNLO 198085",
      description: "Submit an exam with commit method 1",
    },
    {
      command: "open-educoder exam submit MOAPGNLO 198085 --commit-method 1 --json",
      description: "Print the submit workflow responses as JSON",
    },
  ]),
  Command.withAlias("U"),
);

const Single = Command.make(
  "single",
  {
    questionId: Argument.integer("question-id"),
    choiceId: Argument.integer("choice-id"),
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
  Command.withDescription("Save a single-choice answer by question ID and choice ID."),
  Command.withExamples([
    {
      command: "open-educoder exam answer single 12263457 35397429",
      description: "Save using a question ID and a choice ID",
    },
  ]),
  Command.withAlias("S"),
);

const Multiple = Command.make(
  "multiple",
  {
    questionId: Argument.integer("question-id"),
    choiceIds: Argument.string("choice-ids"),
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
  Command.withDescription("Save a multiple-choice answer from a comma-separated list of choice IDs."),
  Command.withExamples([
    {
      command: "open-educoder exam answer multiple 12263483 35397470,35397469",
      description: "Save using a question ID and comma-separated choice IDs",
    },
  ]),
  Command.withAlias("M"),
);

const Text = Command.make(
  "text",
  {
    questionId: Argument.integer("question-id"),
    text: Argument.string("text"),
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
  Command.withDescription("Save a free-text answer for a question."),
  Command.withExamples([
    {
      command: 'open-educoder exam answer text 12263490 "12"',
      description: "Save text for a question ID",
    },
  ]),
  Command.withAlias("T"),
);

const Answer = Command.make("answer").pipe(
  Command.withDescription("Save answers for individual Educoder exam questions."),
  Command.withExamples([
    { command: "open-educoder exam answer single 12263457 35397429", description: "Save a single-choice answer" },
    {
      command: "open-educoder exam answer multiple 12263483 35397470,35397469",
      description: "Save a multiple-choice answer",
    },
    { command: 'open-educoder exam answer text 12263490 "12"', description: "Save a text answer" },
  ]),
  Command.withAlias("A"),
  Command.withSubcommands([Single, Multiple, Text]),
);

export const Exam = Command.make("exam").pipe(
  Command.withDescription("Inspect, answer, and submit Educoder exams for the authenticated user."),
  Command.withExamples([
    { command: "open-educoder exam list MOAPGNLO", description: "List exams for a course" },
    {
      command: "open-educoder exam show MOAPGNLO 198085 --with-choice-content",
      description: "Show questions for an exam",
    },
    { command: "open-educoder exam answer single 12263457 35397429", description: "Save a single-choice answer" },
    { command: "open-educoder exam submit MOAPGNLO 198085", description: "Submit an exam attempt" },
  ]),
  Command.withAlias("e"),
  Command.withSubcommands([List, Info, Start, Show, Submit, Answer]),
);
