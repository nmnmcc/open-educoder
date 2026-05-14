import {
  array,
  formatValue,
  record,
  renderDetails,
  renderFields,
  renderListedCount,
  renderTable,
} from "../shared/output.js";

const text = (value: unknown, fallback = "-") => formatValue(value, fallback);

const answerText = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => text(item)).join(" | ") : text(value);

const orderedEntries = (view: unknown) => {
  const root = record(view);
  const assignments = record(root["assignments"]);
  const order = array(root["order"]).map((item) => String(item));
  const ids = order.length >= 1 ? order : Object.keys(assignments);
  const entries: Array<readonly [string, Record<string, unknown>]> = [];

  for (const id of ids) {
    if (Object.hasOwn(assignments, id)) {
      entries.push([id, record(assignments[id])]);
    }
  }

  return entries;
};

const indentBlock = (value: string, indent = 2) =>
  value
    .split("\n")
    .map((line) => `${" ".repeat(indent)}${line}`)
    .join("\n");

const commands = (values: ReadonlyArray<string>) => ["COMMANDS", ...values.map((value) => `  ${value}`)].join("\n");

const progressText = (progress: Record<string, unknown>) => `${text(progress["finished"])}/${text(progress["total"])}`;

export const renderGeneric = (title: string, value: unknown) => renderDetails(title, value);

export const renderCommonAssignments = (courseId: string, view: unknown) => {
  const root = record(view);
  const category = record(root["category"]);
  const rows = orderedEntries(view).map(([id, item]) => ({ id, item }));

  if (rows.length === 0) {
    return "";
  }

  return [
    "COMMON ASSIGNMENTS",
    renderFields([
      ["Course", courseId],
      ["Category", `${text(category["name"])} (${text(category["id"])})`],
      ["Total", root["total"]],
    ]),
    "",
    renderTable(rows, [
      { header: "ASSIGNMENT", value: (row) => row.id },
      { header: "WORK", value: (row) => row.item["workId"] },
      { header: "STATE", value: (row) => row.item["status"] },
      { header: "WORK-STATE", value: (row) => row.item["workStatus"] },
      { header: "DUE", value: (row) => row.item["endTime"] },
      { header: "LATE", value: (row) => row.item["allowLate"] },
      { header: "NAME", value: (row) => row.item["name"] },
    ]),
    "",
    renderListedCount(rows.length, "common assignment"),
    "",
    commands([`open-educoder a c info <assignment-id>`, `open-educoder a c work ${courseId} <assignment-id>`]),
  ].join("\n");
};

export const renderLabAssignments = (courseId: string, view: unknown) => {
  const root = record(view);
  const category = record(root["category"]);
  const rows = orderedEntries(view).map(([id, item]) => ({ id, item }));

  if (rows.length === 0) {
    return "";
  }

  return [
    "LAB ASSIGNMENTS",
    renderFields([
      ["Course", courseId],
      ["Category", `${text(category["name"])} (${text(category["id"])})`],
      ["Total", root["total"]],
    ]),
    "",
    renderTable(rows, [
      { header: "ASSIGNMENT", value: (row) => row.id },
      { header: "LAB", value: (row) => row.item["labIdentifier"] },
      { header: "WORKSPACE", value: (row) => row.item["workspaceIdentifier"] },
      { header: "PROGRESS", value: (row) => progressText(record(row.item["progress"])) },
      { header: "STATE", value: (row) => row.item["status"] },
      { header: "DUE", value: (row) => row.item["endTime"] },
      { header: "NAME", value: (row) => row.item["name"] },
    ]),
    "",
    renderListedCount(rows.length, "lab assignment"),
    "",
    commands([
      `open-educoder a b challenges ${courseId} <assignment-id>`,
      `open-educoder a b task ${courseId} <assignment-id>`,
      `open-educoder a b learning ${courseId} <assignment-id>`,
      `open-educoder a b content ${courseId} <assignment-id> <path>`,
    ]),
  ].join("\n");
};

export const renderChallenges = (view: unknown) => {
  const root = record(view);
  const assignment = record(root["assignment"]);
  const summary = record(root["summary"]);
  const rows = array(root["challenges"]).map((challenge) => record(challenge));

  return [
    "LAB CHALLENGES",
    renderFields([
      ["Course", assignment["courseId"]],
      ["Assignment", assignment["homeworkId"]],
      ["Lab", assignment["labIdentifier"]],
      ["Name", assignment["name"]],
      ["Score", summary["score"]],
      ["Progress", `${text(summary["passed"])}/${rows.length}`],
      ["Evaluations", summary["evaluateCount"]],
    ]),
    "",
    renderTable(rows, [
      { header: "IDX", value: (row) => row["index"] },
      { header: "CHALLENGE", value: (row) => row["challengeId"] },
      { header: "STATE", value: (row) => row["status"] },
      { header: "PASSED", value: (row) => row["passedStatus"] },
      { header: "SCORE", value: (row) => row["score"] },
      { header: "EVAL", value: (row) => row["evaluateCount"] },
      { header: "NAME", value: (row) => row["name"] },
    ]),
    "",
    renderListedCount(rows.length, "challenge"),
  ]
    .join("\n")
    .trimEnd();
};

export const renderLabTask = (view: unknown) => {
  const root = record(view);
  const resolved = record(root["resolved"]);
  const challenge = record(root["challenge"]);
  const repositoryPath = text(challenge["path"]);
  const courseId = text(resolved["courseId"], "<course-id>");
  const homeworkId = text(resolved["homeworkId"], "<assignment-id>");
  const challengeIndex = text(resolved["challengeIndex"]);
  const challengeFlag = challengeIndex === "-" ? "" : ` --challenge-index ${challengeIndex}`;

  return [
    "LAB TASK",
    renderFields([
      ["Course", resolved["courseId"]],
      ["Assignment", resolved["homeworkId"]],
      ["Lab", resolved["labIdentifier"]],
      ["Task", resolved["taskId"]],
      ["Challenge", resolved["challengeId"]],
      ["Index", resolved["challengeIndex"]],
      ["Name", resolved["challengeName"]],
      ["Repository", repositoryPath],
    ]),
    "",
    commands([
      `open-educoder a b repository ${courseId} ${homeworkId}`,
      `open-educoder a b learning ${courseId} ${homeworkId}${challengeFlag}`,
      `open-educoder a b content ${courseId} ${homeworkId} ${repositoryPath}${challengeFlag}`,
    ]),
  ].join("\n");
};

export const renderChoiceQuestions = (view: unknown) => {
  const root = record(view);
  const resolved = record(root["resolved"]);
  const summary = record(root["summary"]);
  const questions = record(root["questions"]);
  const lines = [
    "OBJECTIVE QUESTIONS",
    renderFields([
      ["Course", resolved["courseId"]],
      ["Assignment", resolved["homeworkId"]],
      ["Task", resolved["taskId"]],
      ["Challenge", resolved["challengeIndex"]],
      ["Count", summary["count"]],
      ["Submitted", summary["submitted"]],
      ["Complete", summary["allSubmitted"]],
    ]),
  ];

  for (const [position, questionValue] of Object.entries(questions)) {
    const question = record(questionValue);
    const type = record(question["type"]);
    const options = Object.entries(record(question["options"])).map(([label, optionValue]) => ({
      label,
      option: record(optionValue),
    }));

    lines.push(
      "",
      `[${position}] ${text(type["name"])} ${text(question["subject"])}`,
      renderFields(
        [
          ["Answer", answerText(question["answer"])],
          ["Result", question["result"]],
        ],
        2,
      ),
    );

    if (options.length >= 1) {
      lines.push(
        indentBlock(
          renderTable(options, [
            { header: "OPT", value: (row) => row.label },
            { header: "TEXT", value: (row) => row.option["text"] },
          ]),
        ),
      );
    }
  }

  return lines.join("\n").trimEnd();
};

export const renderChoiceSubmit = (view: unknown) => {
  const root = record(view);
  const summary = record(root["summary"]);
  const results = record(root["results"]);
  const lines = [
    "OBJECTIVE ANSWER RESULT",
    renderFields([
      ["Grade", summary["grade"]],
      ["Correct", `${text(summary["correct"])}/${text(summary["count"])}`],
      ["Complete", summary["allSubmitted"]],
      ["Next", summary["nextTaskId"]],
    ]),
  ];

  for (const [position, resultValue] of Object.entries(results)) {
    const result = record(resultValue);
    const type = record(result["type"]);

    lines.push(
      "",
      `[${position}] ${text(type["name"])} ${text(result["subject"])}`,
      renderFields(
        [
          ["Actual", answerText(result["actual"])],
          ["Standard", answerText(result["standard"])],
          ["Result", result["result"]],
        ],
        2,
      ),
    );
  }

  return lines.join("\n").trimEnd();
};

export const renderRepository = (view: unknown) => {
  const repository = record(record(view)["repository"]);
  const rows = Object.entries(record(repository["entries"])).map(([name, entry]) => {
    const item = record(entry);

    return {
      name,
      type: item["type"],
      path: item["path"],
    };
  });

  return [
    "REPOSITORY",
    renderFields([["Path", repository["path"]]]),
    "",
    renderTable(rows, [
      { header: "TYPE", value: (row) => row.type },
      { header: "PATH", value: (row) => row.path ?? row.name },
    ]),
    "",
    renderListedCount(rows.length, "entry", "entries"),
  ]
    .join("\n")
    .trimEnd();
};
