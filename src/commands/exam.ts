import { Console, Data, Effect, Option } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";
import { AppContext } from "../services/context/index.js";
import { EducoderApi } from "../services/educoder-api/index.js";
import { inspectOptions } from "../utils/inspect-options.js";

class AnswerInputError extends Data.TaggedError("AnswerInputError")<{
  readonly message: string;
}> {}

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

const formatChoices = (
  choices: ReadonlyArray<{
    readonly choice_id: number;
    readonly choice_position: number;
    readonly choice_text: string;
    readonly user_answer_boolean: boolean;
  }>,
  includeContent: boolean,
) =>
  Object.fromEntries(
    choices.map((choice) => [
      choice.choice_position,
      {
        id: choice.choice_id,
        selected: choice.user_answer_boolean,
        ...(includeContent ? { text: choice.choice_text } : {}),
      },
    ]),
  );

const formatLabels = (labels: ReadonlyArray<string>) => labels.join(", ");

const makeExamRequest = (courseId: string, examId: number, login: string) => ({
  params: {
    examId,
  },
  query: {
    coursesId: courseId,
    categoryId: examId,
    login,
    zzud: login,
  },
});

const makeBeginCommitRequest = (examId: number, login: string) => ({
  params: {
    examId,
  },
  query: {
    id: examId,
    zzud: login,
  },
});

const makeCommitRequest = (examId: number, login: string, commitMethod: number) => ({
  params: {
    examId,
  },
  query: {
    zzud: login,
  },
  payload: {
    categoryId: examId,
    commit_method: commitMethod,
  },
});

const parseChoiceIds = Effect.fn("exam.parseChoiceIds")(function* (value: string) {
  const parts = value.split(",").map((item) => item.trim());
  const parsed = parts.map((item) => Number(item));

  if (parts.length === 0 || parts.some((item) => item.length === 0) || parsed.some((item) => !Number.isInteger(item))) {
    return yield* new AnswerInputError({
      message: "Provide choice-ids as a comma-separated list of integers.",
    });
  }

  return parsed;
});

const resolveLogin = Effect.fn("exam.resolveLogin")(function* (login: Option.Option<string>) {
  if (Option.isSome(login)) {
    return login.value;
  }

  const ctx = yield* AppContext;
  const user = yield* ctx.user;

  return user.login;
});

const answerQuestion = Effect.fn("exam.answerQuestion")(function* (input: {
  readonly questionId: number;
  readonly exerciseChoiceId: number | ReadonlyArray<number>;
  readonly answerText: string | null;
  readonly login: Option.Option<string>;
}) {
  const login = yield* resolveLogin(input.login);
  const educoder = yield* EducoderApi;
  const response = yield* educoder.Exam.answer({
    params: {
      questionId: input.questionId,
    },
    query: {
      zzud: login,
    },
    payload: {
      questionId: input.questionId,
      exercise_choice_id: input.exerciseChoiceId,
      answer_text: input.answerText,
    },
  });

  yield* printJson(response);
});

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
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin(input.login);
    const response = yield* educoder.Course.exercises({
      params: {
        courseId: input.courseId,
      },
      query: {
        coursesId: input.courseId,
        limit: input.limit,
        type: input.type,
        id: input.courseId,
        page: input.page,
        zzud: login,
      },
    });

    if (input.json) {
      return yield* printJson(response);
    }

    if (response.exercises.length === 0) {
      return yield* Console.log("No exams found.");
    }

    yield* Console.dir(
      {
        total: response.total_count,
        exams: Object.fromEntries(
          response.exercises.map((exam) => [
            exam.id,
            {
              name: exam.exercise_name,
              author: exam.author,
              tips: formatLabels(exam.exercise_tips),
              created: exam.created_at,
              time: exam.time,
              random: exam.is_random,
              locked: exam.is_locked,
              screenOpen: exam.screen_open,
              currentStatus: exam.current_status,
              exerciseStatus: exam.exercise_status,
              wholeStatus: exam.whole_exercise_status,
              leftTime: exam.exercise_left_time,
              exerciseUserId: exam.exercise_user_id,
              commitMethod: exam.commit_method,
            },
          ]),
        ),
      },
      inspectOptions,
    );
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
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin(input.login);
    const response = yield* educoder.Exam.info(makeExamRequest(input.courseId, input.examId, login));

    yield* printJson(response);
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
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin(input.login);
    const response = yield* educoder.Exam.start(makeExamRequest(input.courseId, input.examId, login));

    yield* printJson(response);
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
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin(input.login);
    const response = yield* educoder.Exam.start(makeExamRequest(input.courseId, input.examId, login));
    const questions = response.exercise_question_types.flatMap((questionType) =>
      questionType.items.map((question) => {
        const choices = question.question_choices ?? [];

        return {
          number: question.question_num,
          id: question.question_id,
          type: questionType.name,
          typeId: question.question_type,
          score: question.question_score,
          choices: formatChoices(choices, input.withChoiceContent),
          title: question.question_title,
        };
      }),
    );

    if (input.json) {
      return yield* printJson({
        questions,
      });
    }

    if (questions.length === 0) {
      return yield* Console.log("No questions found.");
    }

    yield* Console.dir(
      {
        questions: Object.fromEntries(
          questions.map((question) => [
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
    const educoder = yield* EducoderApi;
    const login = yield* resolveLogin(input.login);
    const examRequest = makeExamRequest(input.courseId, input.examId, login);
    const time = yield* educoder.Exam.time(examRequest);
    const preview = yield* educoder.Exam.beginCommit(makeBeginCommitRequest(input.examId, login));
    const commit = yield* educoder.Exam.commit(makeCommitRequest(input.examId, login, input.commitMethod));

    if (input.json) {
      return yield* printJson({
        time,
        preview,
        commit,
      });
    }

    yield* Console.dir(
      {
        submit: {
          status: commit.status,
          message: commit.message,
          commitTime: commit.data?.commit_time ?? null,
          userExerciseTime: commit.data?.user_exercise_time ?? null,
          leftTime: time.left_time,
          studentLeftMinutes: time.student_left_minutes,
          userEndTime: time.user_end_time,
          unanswered: {
            shixun: preview.shixun_undo,
            question: preview.question_undo,
            oj: preview.oj_undo,
          },
          serverEndTime: preview.end_time,
        },
      },
      inspectOptions,
    );
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
    yield* answerQuestion({
      questionId: input.questionId,
      exerciseChoiceId: input.choiceId,
      answerText: null,
      login: input.login,
    });
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
    const choiceIds = yield* parseChoiceIds(input.choiceIds);

    yield* answerQuestion({
      questionId: input.questionId,
      exerciseChoiceId: choiceIds,
      answerText: null,
      login: input.login,
    });
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
    yield* answerQuestion({
      questionId: input.questionId,
      exerciseChoiceId: 1,
      answerText: input.text,
      login: input.login,
    });
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
