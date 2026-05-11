import { Console, Data, Effect, Option } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";
import { EducoderApi } from "../services/educoder-api/index.js";

class AnswerInputError extends Data.TaggedError("AnswerInputError")<{
  readonly message: string;
}> {}

const OptionalLogin = Flag.string("login").pipe(Flag.optional);
const WithChoiceContent = Flag.boolean("with-choice-content").pipe(Flag.withAlias("c"));
const ChoiceIds = Flag.string("choice-ids").pipe(Flag.optional);
const TextItems = Flag.string("text-items").pipe(Flag.optional);

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

const parseList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const parseChoiceIds = Effect.fn("exam.parseChoiceIds")(function* (value: string) {
  const parsed = parseList(value).map((item) => Number(item));

  if (parsed.length === 0 || parsed.some((item) => !Number.isInteger(item))) {
    return yield* new AnswerInputError({
      message: "Provide --choice-ids as a comma-separated list of integers.",
    });
  }

  return parsed;
});

const resolveLogin = Effect.fn("exam.resolveLogin")(function* (login: Option.Option<string>) {
  if (Option.isSome(login)) {
    return login.value;
  }

  const educoder = yield* EducoderApi;
  const user = yield* educoder.User.getInfo();

  return user.login;
});

export const exam = Command.make("exam").pipe(
  Command.withSubcommands([
    Command.make(
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
    ),
    Command.make(
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
    ),
    Command.make(
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
          { colors: true, depth: null },
        );
      }),
    ),
    Command.make(
      "answer",
      {
        questionId: Argument.integer("question-id"),
        choiceId: Flag.integer("choice-id").pipe(Flag.optional),
        choiceIds: ChoiceIds,
        text: Flag.string("text").pipe(Flag.optional),
        textItems: TextItems,
        position: Flag.integer("position").pipe(Flag.optional),
        login: OptionalLogin,
      },
      Effect.fn("exam.answer")(function* (input) {
        const hasChoice = Option.isSome(input.choiceId);
        const hasChoices = Option.isSome(input.choiceIds);
        const hasText = Option.isSome(input.text);
        const hasTextItems = Option.isSome(input.textItems);

        if ([hasChoice, hasChoices, hasText, hasTextItems].filter(Boolean).length !== 1) {
          return yield* new AnswerInputError({
            message: "Provide exactly one of --choice-id, --choice-ids, --text, or --text-items.",
          });
        }

        const login = yield* resolveLogin(input.login);
        const educoder = yield* EducoderApi;
        const choiceIds = Option.isSome(input.choiceIds) ? yield* parseChoiceIds(input.choiceIds.value) : null;
        const textItems = Option.isSome(input.textItems) ? parseList(input.textItems.value) : null;
        const blankPosition = Option.isSome(input.position) ? input.position.value : null;
        const request = {
          params: {
            questionId: input.questionId,
          },
          query: {
            zzud: login,
          },
        };
        const response = yield* educoder.Exam.answer({
          ...request,
          payload: {
            questionId: input.questionId,
            exercise_choice_id: Option.isSome(input.choiceId) ? input.choiceId.value : choiceIds ?? blankPosition,
            answer_text: Option.isSome(input.text) ? input.text.value : textItems,
          },
        });

        yield* printJson(response);
      }),
    ),
  ]),
);
