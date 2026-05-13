import { Context, Data, Effect, Layer } from "effect";

import { AppContext } from "../context/index.js";
import { EducoderApi } from "../educoder-api/index.js";
import { type EducoderApiResponse, type FeatureWorkflow } from "./shared.js";

export class AnswerInputError extends Data.TaggedError("AnswerInputError")<{
  readonly message: string;
}> {}

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

type ExamChoiceView = {
  readonly id: number;
  readonly selected: boolean;
  readonly text?: string;
};

const formatChoices = (
  choices: ReadonlyArray<{
    readonly choice_id: number;
    readonly choice_position: number;
    readonly choice_text: string;
    readonly user_answer_boolean?: boolean | null | undefined;
  }>,
  includeContent: boolean,
) => {
  const formatted: Record<number, ExamChoiceView> = {};

  for (const choice of choices) {
    formatted[choice.choice_position] = includeContent
      ? {
          id: choice.choice_id,
          selected: choice.user_answer_boolean ?? false,
          text: choice.choice_text,
        }
      : {
          id: choice.choice_id,
          selected: choice.user_answer_boolean ?? false,
        };
  }

  return formatted;
};

type ListExamsInput = {
  readonly courseId: string;
  readonly page: number;
  readonly limit: number;
  readonly type: string;
  readonly login?: string | undefined;
};

type ExamInput = {
  readonly courseId: string;
  readonly examId: number;
  readonly login?: string | undefined;
};

type ShowExamInput = {
  readonly courseId: string;
  readonly examId: number;
  readonly login?: string | undefined;
  readonly withChoiceContent: boolean;
};

type ShowExamView = {
  readonly questions: ReadonlyArray<{
    readonly number: number;
    readonly id: number;
    readonly type: string;
    readonly typeId: number;
    readonly score: string;
    readonly choices: Record<number, ExamChoiceView>;
    readonly title: string;
  }>;
};

type SubmitExamInput = {
  readonly courseId: string;
  readonly examId: number;
  readonly login?: string | undefined;
  readonly commitMethod: number;
};

type AnswerQuestionInput = {
  readonly questionId: number;
  readonly exerciseChoiceId: number | ReadonlyArray<number>;
  readonly answerText: string | null;
  readonly login?: string | undefined;
};

type ListExamsRaw = EducoderApiResponse<"Course", "exercises">;
type ExamInfoRaw = EducoderApiResponse<"Exam", "info">;
type ExamStartRaw = EducoderApiResponse<"Exam", "start">;
type ExamTimeRaw = EducoderApiResponse<"Exam", "time">;
type ExamBeginCommitRaw = EducoderApiResponse<"Exam", "beginCommit">;
type ExamCommitRaw = EducoderApiResponse<"Exam", "commit">;
type AnswerQuestionRaw = EducoderApiResponse<"Exam", "answer">;

type ListExamsView = {
  readonly total: number;
  readonly exams: Record<
    string,
    {
      readonly name: string;
      readonly author: string;
      readonly tips: string;
      readonly created: string;
      readonly time: number;
      readonly random: boolean;
      readonly locked: boolean;
      readonly screenOpen: boolean;
      readonly currentStatus: number;
      readonly exerciseStatus: number;
      readonly wholeStatus: number;
      readonly leftTime: string | null;
      readonly exerciseUserId: number;
      readonly commitMethod: string;
    }
  >;
};

type SubmitExamRaw = {
  readonly time: ExamTimeRaw;
  readonly preview: ExamBeginCommitRaw;
  readonly commit: ExamCommitRaw;
};

type SubmitExamView = {
  readonly submit: {
    readonly status: number;
    readonly message: string;
    readonly commitTime: string | null;
    readonly userExerciseTime: string | null;
    readonly leftTime: number;
    readonly studentLeftMinutes: number;
    readonly userEndTime: string;
    readonly unanswered: {
      readonly lab: number;
      readonly question: number;
      readonly oj: number;
    };
    readonly serverEndTime: string;
  };
};

export type ExamFeatureShape = {
  readonly parseChoiceIds: (value: string) => Effect.Effect<ReadonlyArray<number>, AnswerInputError>;
  readonly list: FeatureWorkflow<ListExamsInput, ListExamsRaw, ListExamsView>;
  readonly getInfo: FeatureWorkflow<ExamInput, ExamInfoRaw, ExamInfoRaw>;
  readonly start: FeatureWorkflow<ExamInput, ExamStartRaw, ExamStartRaw>;
  readonly show: FeatureWorkflow<ShowExamInput, ExamStartRaw, ShowExamView>;
  readonly submit: FeatureWorkflow<SubmitExamInput, SubmitExamRaw, SubmitExamView>;
  readonly answer: FeatureWorkflow<AnswerQuestionInput, AnswerQuestionRaw, AnswerQuestionRaw>;
};

export class ExamFeature extends Context.Service<ExamFeature, ExamFeatureShape>()(
  "open-educoder/services/features/ExamFeature",
) {
  public static readonly layer = Layer.effect(
    ExamFeature,
    Effect.gen(function* () {
      const ctx = yield* AppContext;
      const educoder = yield* EducoderApi;

      const resolveLogin = Effect.fn("features.exam.resolveLogin")(function* (login?: string | undefined) {
        if (login !== undefined) {
          return login;
        }

        const user = yield* ctx.user;

        return user.login;
      });

      const parseChoiceIds: ExamFeatureShape["parseChoiceIds"] = Effect.fn("features.exam.parseChoiceIds")(
        function* (value) {
          const parts = value.split(",").map((item) => item.trim());
          const parsed = parts.map((item) => Number(item));

          if (
            parts.length === 0 ||
            parts.some((item) => item.length === 0) ||
            parsed.some((item) => !Number.isInteger(item))
          ) {
            return yield* new AnswerInputError({
              message: "Provide choice-ids as a comma-separated list of integers.",
            });
          }

          return parsed;
        },
      );

      const list: ExamFeatureShape["list"] = Effect.fn("features.exam.list")(function* (input) {
        const login = yield* resolveLogin(input.login);
        const raw = yield* educoder.Course.exercises({
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

        return {
          raw,
          view: {
            total: raw.total_count,
            exams: Object.fromEntries(
              raw.exercises.map((exam) => [
                exam.id,
                {
                  name: exam.exercise_name,
                  author: exam.author ?? "",
                  tips: (exam.exercise_tips ?? []).join(", "),
                  created: exam.created_at,
                  time: exam.time,
                  random: exam.is_random,
                  locked: exam.is_locked,
                  screenOpen: exam.screen_open,
                  currentStatus: exam.current_status,
                  exerciseStatus: exam.exercise_status,
                  wholeStatus: exam.whole_exercise_status,
                  leftTime: exam.exercise_left_time ?? null,
                  exerciseUserId: exam.exercise_user_id,
                  commitMethod: exam.commit_method ?? "",
                },
              ]),
            ),
          },
        };
      });

      const getInfo: ExamFeatureShape["getInfo"] = Effect.fn("features.exam.info")(function* (input) {
        const login = yield* resolveLogin(input.login);
        const raw = yield* educoder.Exam.info(makeExamRequest(input.courseId, input.examId, login));

        return {
          raw,
          view: raw,
        };
      });

      const start: ExamFeatureShape["start"] = Effect.fn("features.exam.start")(function* (input) {
        const login = yield* resolveLogin(input.login);
        const raw = yield* educoder.Exam.start(makeExamRequest(input.courseId, input.examId, login));

        return {
          raw,
          view: raw,
        };
      });

      const show: ExamFeatureShape["show"] = Effect.fn("features.exam.show")(function* (input) {
        const started = yield* start(input);
        const questions = started.raw.exercise_question_types.flatMap((questionType) =>
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
        const view = {
          questions,
        };

        return {
          raw: started.raw,
          view,
        };
      });

      const submit: ExamFeatureShape["submit"] = Effect.fn("features.exam.submit")(function* (input) {
        const login = yield* resolveLogin(input.login);
        const examRequest = makeExamRequest(input.courseId, input.examId, login);
        const time = yield* educoder.Exam.time(examRequest);
        const preview = yield* educoder.Exam.beginCommit(makeBeginCommitRequest(input.examId, login));
        const commit = yield* educoder.Exam.commit(makeCommitRequest(input.examId, login, input.commitMethod));
        const raw = {
          time,
          preview,
          commit,
        };

        return {
          raw,
          view: {
            submit: {
              status: commit.status,
              message: commit.message,
              commitTime: commit.data?.commit_time ?? null,
              userExerciseTime: commit.data?.user_exercise_time ?? null,
              leftTime: time.left_time,
              studentLeftMinutes: time.student_left_minutes,
              userEndTime: time.user_end_time,
              unanswered: {
                lab: preview.shixun_undo,
                question: preview.question_undo,
                oj: preview.oj_undo,
              },
              serverEndTime: preview.end_time,
            },
          },
        };
      });

      const answer: ExamFeatureShape["answer"] = Effect.fn("features.exam.answer")(function* (input) {
        const login = yield* resolveLogin(input.login);
        const raw = yield* educoder.Exam.answer({
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

        return {
          raw,
          view: raw,
        };
      });

      return ExamFeature.of({
        parseChoiceIds,
        list,
        getInfo,
        start,
        show,
        submit,
        answer,
      });
    }),
  );
}
