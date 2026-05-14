/** @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { Effect } from "effect";
import { useState } from "react";

import { ExamFeature } from "../../services/features/exam.js";
import type { Navigator, PageProps, Route } from "../app/types.js";
import { MenuPage } from "../components/MenuPage.js";
import { askRequired } from "../shared/pageHelpers.js";
import {
  Colors,
  FieldList,
  Page,
  RemotePane,
  type SelectItem,
  SelectList,
  TextAttrs,
  asRecord,
  keyText,
  optionalText,
  stringValue,
  useRemoteData,
  useSelectedIndex,
} from "../ui/index.js";

export const ExamsPage = Effect.gen(function* () {
  const exam = yield* ExamFeature;

  return function ExamsPage({ route, nav, active }: PageProps<Extract<Route, { name: "exams" }>>) {
    const [page, setPage] = useState(1);
    const [refresh, setRefresh] = useState(0);
    const data = useRemoteData(`exams:${route.courseId}:${page}:${refresh}`, () =>
      exam.list({ courseId: route.courseId, page, limit: 20, type: "" }),
    );

    useKeyboard((event) => {
      if (!active) {
        return;
      }

      const input = keyText(event);

      if (input === "n") {
        setPage((value) => value + 1);
        return;
      }

      if (input === "p") {
        setPage((value) => Math.max(1, value - 1));
        return;
      }

      if (input === "r") {
        setRefresh((value) => value + 1);
      }
    });

    return (
      <Page title="Exams" subtitle={route.courseName} footer="Enter open  n/p page  r refresh  Esc back  q quit">
        <RemotePane data={data}>
          {(result) => (
            <ExamsContent result={result} route={route} page={page} refresh={refresh} nav={nav} active={active} />
          )}
        </RemotePane>
      </Page>
    );
  };
});

function ExamsContent({
  result,
  route,
  page,
  refresh,
  nav,
  active,
}: {
  readonly result: { readonly view: unknown };
  readonly route: Extract<Route, { name: "exams" }>;
  readonly page: number;
  readonly refresh: number;
  readonly nav: Navigator;
  readonly active: boolean;
}) {
  const view = asRecord(result.view);
  const exams = asRecord(view["exams"]);
  const entries = Object.entries(exams);
  const [selected, setSelected] = useSelectedIndex(entries.length, `exam-list:${page}:${refresh}`);
  const items = entries.map(([id, exam]) => {
    const record = asRecord(exam);

    return {
      id,
      label: stringValue(record["name"], id),
      description: `${stringValue(record["author"])}  ${stringValue(record["tips"])}`,
      meta: `status ${optionalText(record["currentStatus"]) ?? "-"}  left ${optionalText(record["leftTime"]) ?? "-"}`,
    };
  });

  return (
    <box flexDirection="column">
      <FieldList
        fields={[
          ["page", page],
          ["total", view["total"]],
        ]}
      />
      <box marginTop={1}>
        <SelectList
          items={items}
          selected={selected}
          onSelectedChange={setSelected}
          onOpen={(item) =>
            nav.push({
              name: "examDetail",
              courseId: route.courseId,
              courseName: route.courseName,
              examId: Number.parseInt(item.id, 10),
              examName: item.label,
              started: false,
            })
          }
          active={active}
          empty="No exams found."
        />
      </box>
    </box>
  );
}

export const ExamDetailPage = Effect.gen(function* () {
  const exam = yield* ExamFeature;

  return function ExamDetailPage({ route, nav, ui, active }: PageProps<Extract<Route, { name: "examDetail" }>>) {
    const items: ReadonlyArray<SelectItem> = [
      { id: "info", label: "Info", description: "Fetch exam session state" },
      { id: "start", label: "Start or resume", description: "Explicitly start/resume before questions are shown" },
      { id: "show", label: "Show questions", description: "Question text, choices and selected answers" },
      { id: "single", label: "Answer single choice", description: "Save one selected choice" },
      { id: "multiple", label: "Answer multiple choice", description: "Save comma-separated choice IDs" },
      { id: "text", label: "Answer text", description: "Save a free-text answer" },
      { id: "submit", label: "Submit exam", description: "Submit current answer state" },
    ];

    const run = async (id: string) => {
      if (id === "info") {
        await ui.runAction("Exam info", exam.getInfo({ courseId: route.courseId, examId: route.examId }));
        return;
      }

      if (id === "start") {
        const confirmed = await ui.danger(
          "Start or resume exam",
          `Start/resume exam ${route.examId}.`,
          String(route.examId),
        );

        if (confirmed) {
          const started = await ui.runAction(
            "Start or resume exam",
            exam.start({ courseId: route.courseId, examId: route.examId }),
          );

          if (started !== null) {
            nav.replace({ ...route, started: true });
          }
        }

        return;
      }

      if (id === "show") {
        if (!route.started) {
          ui.showError("Show questions", new Error("Start or resume this exam first."));
          return;
        }

        nav.push({
          name: "examShow",
          courseId: route.courseId,
          courseName: route.courseName,
          examId: route.examId,
          examName: route.examName,
        });
        return;
      }

      if (id === "single") {
        const questionId = await askRequired(ui, "Single choice", "question-id");
        const choiceId = questionId === null ? null : await askRequired(ui, "Single choice", "choice-id");

        if (questionId !== null && choiceId !== null) {
          await ui.runAction(
            "Answer single choice",
            exam.answer({
              questionId: Number.parseInt(questionId, 10),
              exerciseChoiceId: Number.parseInt(choiceId, 10),
              answerText: null,
            }),
          );
        }

        return;
      }

      if (id === "multiple") {
        const questionId = await askRequired(ui, "Multiple choice", "question-id");
        const choiceIds = questionId === null ? null : await askRequired(ui, "Multiple choice", "choice-ids");

        if (questionId !== null && choiceIds !== null) {
          await ui.runAction(
            "Answer multiple choice",
            Effect.gen(function* () {
              const parsed = yield* exam.parseChoiceIds(choiceIds);

              return yield* exam.answer({
                questionId: Number.parseInt(questionId, 10),
                exerciseChoiceId: parsed,
                answerText: null,
              });
            }),
          );
        }

        return;
      }

      if (id === "text") {
        const questionId = await askRequired(ui, "Text answer", "question-id");
        const answer = questionId === null ? null : await ui.prompt("Text answer", "answer", "");

        if (questionId !== null && answer !== null) {
          await ui.runAction(
            "Answer text",
            exam.answer({
              questionId: Number.parseInt(questionId, 10),
              exerciseChoiceId: 1,
              answerText: answer,
            }),
          );
        }

        return;
      }

      const confirmed = await ui.danger("Submit exam", "This submits the current exam attempt.", String(route.examId));

      if (confirmed) {
        await ui.runAction(
          "Submit exam",
          exam.submit({
            courseId: route.courseId,
            examId: route.examId,
            commitMethod: 1,
          }),
        );
      }
    };

    return (
      <MenuPage
        title={route.examName}
        subtitle={`exam ${route.examId}  ${route.started ? "started/resumed" : "not started in this TUI session"}`}
        items={items}
        active={active}
        onOpen={(item) => void run(item.id)}
      />
    );
  };
});

export const ExamShowPage = Effect.gen(function* () {
  const exam = yield* ExamFeature;

  return function ExamShowPage({ route, ui, active }: PageProps<Extract<Route, { name: "examShow" }>>) {
    const data = useRemoteData(`exam-show:${route.courseId}:${route.examId}`, () =>
      exam.show({ courseId: route.courseId, examId: route.examId, withChoiceContent: true }),
    );

    useKeyboard((event) => {
      if (active && keyText(event) === "j" && data.tag === "success") {
        ui.showJson("Exam questions JSON", data.value.view);
      }
    });

    return (
      <Page title="Exam Questions" subtitle={`${route.examName}  ${route.examId}`} footer="j JSON  Esc back  q quit">
        <RemotePane data={data}>
          {(result) => {
            const value = asRecord(result.view)["questions"];
            const questions: ReadonlyArray<unknown> = Array.isArray(value) ? value : [];

            return questions.length < 1 ? (
              <text fg={Colors.gray} attributes={TextAttrs.dim} wrapMode="word">
                No questions found.
              </text>
            ) : (
              <box flexDirection="column">
                {questions.map((question, index) => {
                  const record = asRecord(question);

                  return (
                    <box key={index} flexDirection="column" marginBottom={1}>
                      <text fg={Colors.cyan} attributes={TextAttrs.bold} wrapMode="word">
                        {optionalText(record["number"]) ?? index + 1}. {stringValue(record["type"])}{" "}
                        {optionalText(record["score"]) ?? "-"} pts
                      </text>
                      <text wrapMode="word">{stringValue(record["title"])}</text>
                      <text fg={Colors.gray} attributes={TextAttrs.dim} wrapMode="word">
                        question id {optionalText(record["id"]) ?? "-"}
                      </text>
                    </box>
                  );
                })}
              </box>
            );
          }}
        </RemotePane>
      </Page>
    );
  };
});
