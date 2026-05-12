const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const record = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {});

const array = (value: unknown): ReadonlyArray<unknown> => (Array.isArray(value) ? value : []);

const text = (value: unknown, fallback = "-") => {
  if (typeof value === "string" && value.length >= 1) {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
};

const yesNo = (value: unknown) => (value === true ? "是 yes" : value === false ? "否 no" : "-");

const field = (label: string, value: unknown) => `  ${label}: ${text(value)}`;

const command = (value: string) => `    ${value}`;

const stringify = (value: unknown) => JSON.stringify(value, null, 2);

const orderedEntries = (view: unknown) => {
  const root = record(view);
  const homeworks = record(root["homeworks"]);
  const order = array(root["order"]).map((item) => String(item));
  const ids = order.length >= 1 ? order : Object.keys(homeworks);

  return ids.flatMap((id) => (Object.hasOwn(homeworks, id) ? ([[id, record(homeworks[id])]] as const) : []));
};

const heading = (title: string, courseId?: string) =>
  courseId === undefined ? title : `${title}\n课程ID / course-id: ${courseId}`;

export const renderGeneric = (title: string, value: unknown) => `${title}\n${stringify(value)}`;

export const renderCommonHomeworks = (courseId: string, view: unknown) => {
  const root = record(view);
  const category = record(root["category"]);
  const lines = [
    heading("普通作业列表 / Common Homework List", courseId),
    `分类 / category: ${text(category["name"])}`,
    `总数 / total: ${text(root["total"])}`,
    "",
  ];

  for (const [index, [id, item]] of orderedEntries(view).entries()) {
    lines.push(
      `[${index + 1}] ${text(item["name"], id)}`,
      field("作业ID / homework-id", id),
      field("作品ID / work-id", item["workId"]),
      field("状态 / status", item["status"]),
      field("提交状态 / work-status", item["workStatus"]),
      field("截止 / due", item["endTime"]),
      field("允许补交 / allow-late", yesNo(item["allowLate"])),
      "  下一步 / next:",
      command(`open-educoder h c info ${id}`),
      command(`open-educoder h c works ${courseId} ${id}`),
      "",
    );
  }

  return lines.join("\n").trimEnd();
};

export const renderShixunHomeworks = (courseId: string, view: unknown) => {
  const root = record(view);
  const category = record(root["category"]);
  const lines = [
    heading("实训作业列表 / Shixun Homework List", courseId),
    `分类 / category: ${text(category["name"])}`,
    `总数 / total: ${text(root["total"])}`,
    "",
  ];

  for (const [index, [id, item]] of orderedEntries(view).entries()) {
    const progress = record(item["progress"]);

    lines.push(
      `[${index + 1}] ${text(item["name"], id)}`,
      field("作业ID / homework-id", id),
      field("实训ID / shixun-id", item["shixunIdentifier"]),
      field("我的实训ID / myshixun-id", item["myshixunIdentifier"]),
      field("状态 / status", item["status"]),
      field("截止 / due", item["endTime"]),
      `  进度 / progress: ${text(progress["finished"])}/${text(progress["total"])}`,
      "  下一步 / next:",
      command(`open-educoder h x challenges ${courseId} ${id}`),
      command(`open-educoder h x task ${courseId} ${id}`),
      command(`open-educoder h x content ${courseId} ${id} <path>`),
      "",
    );
  }

  return lines.join("\n").trimEnd();
};

export const renderChallenges = (view: unknown) => {
  const root = record(view);
  const homework = record(root["homework"]);
  const summary = record(root["summary"]);
  const challenges = array(root["challenges"]).map(record);
  const lines = [
    "实训关卡 / Shixun Challenges",
    field("课程ID / course-id", homework["courseId"]),
    field("作业ID / homework-id", homework["homeworkId"]),
    field("实训ID / shixun-id", homework["shixunIdentifier"]),
    field("作业名称 / homework-name", homework["name"]),
    field("成绩 / score", summary["score"]),
    `  进度 / progress: ${text(summary["passed"])}/${challenges.length}`,
    "",
  ];

  for (const challenge of challenges) {
    lines.push(
      `[${text(challenge["index"])}] ${text(challenge["name"])}`,
      field("关卡序号 / challenge-index", challenge["index"]),
      field("关卡ID / challenge-id", challenge["challengeId"]),
      field("分数 / score", challenge["score"]),
      field("状态 / status", challenge["status"]),
      field("通过状态 / passed-status", challenge["passedStatus"]),
      field("评测次数 / evaluate-count", challenge["evaluateCount"]),
      "",
    );
  }

  return lines.join("\n").trimEnd();
};

export const renderShixunTask = (view: unknown) => {
  const root = record(view);
  const resolved = record(root["resolved"]);
  const challenge = record(root["challenge"]);
  const repositoryPath = text(challenge["path"]);
  const lines = [
    "实训任务 / Shixun Task",
    field("课程ID / course-id", resolved["courseId"]),
    field("作业ID / homework-id", resolved["homeworkId"]),
    field("实训ID / shixun-id", resolved["shixunIdentifier"]),
    field("任务ID / task-id", resolved["taskId"]),
    field("关卡序号 / challenge-index", resolved["challengeIndex"]),
    field("关卡ID / challenge-id", resolved["challengeId"]),
    field("关卡名称 / challenge-name", resolved["challengeName"]),
    field("仓库路径 / repository-path", repositoryPath),
    "  下一步 / next:",
    command(`open-educoder h x repository ${text(resolved["courseId"])} ${text(resolved["homeworkId"])}`),
    command(
      `open-educoder h x content ${text(resolved["courseId"])} ${text(resolved["homeworkId"])} ${repositoryPath}`,
    ),
  ];

  return lines.join("\n");
};

export const renderRepository = (view: unknown) => {
  const repository = record(record(view)["repository"]);
  const entries = record(repository["entries"]);
  const lines = ["仓库目录 / Repository", field("路径 / path", repository["path"]), ""];

  for (const [name, entry] of Object.entries(entries)) {
    const item = record(entry);

    lines.push(`${text(item["type"])}\t${text(item["path"], name)}`);
  }

  return lines.join("\n").trimEnd();
};
