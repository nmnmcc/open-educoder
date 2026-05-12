import { Effect } from "effect";
import { Box, useInput } from "ink";
import { useState } from "react";

import { LabAssignmentFeature } from "../../../services/features/assignments/lab.js";
import type { Navigator, PageProps, Route } from "../../app/types.js";
import { MenuPage } from "../../components/MenuPage.js";
import { cleanupEditedContent, editInExternalEditor, readUtf8File, runSsh } from "../../runtime/process.js";
import { askRequired, nonNegativeNumber, renderResult, selectedRecord } from "../../shared/pageHelpers.js";
import {
  FieldList,
  JsonBlock,
  Page,
  RemotePane,
  type SelectItem,
  SelectList,
  asRecord,
  objectEntries,
  optionalText,
  stringValue,
  useRemoteData,
  useSelectedIndex,
} from "../../ui/index.js";

export const LabListPage = Effect.gen(function* () {
  const labAssignment = yield* LabAssignmentFeature;

  return function LabListPage({ route, nav, ui, active }: PageProps<Extract<Route, { name: "labList" }>>) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [refresh, setRefresh] = useState(0);
    const data = useRemoteData(`lab:${route.courseId}:${page}:${search}:${refresh}`, () =>
      labAssignment.list({
        courseId: route.courseId,
        status: 0,
        page,
        limit: 20,
        search: search.length >= 1 ? search : undefined,
      }),
    );

    useInput(
      (input) => {
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
          return;
        }

        if (input === "/") {
          void ui.prompt("Search lab assignments", "keyword", search).then((value) => {
            if (value !== null) {
              setSearch(value.trim());
              setPage(1);
            }
          });
        }
      },
      { isActive: active },
    );

    return (
      <Page
        title="Lab Assignments"
        subtitle={`${route.courseName}  search "${search}"`}
        footer="Enter open  / search  n/p page  r refresh  Esc back  q quit"
      >
        <RemotePane data={data}>
          {(result) => (
            <LabListContent
              result={result}
              route={route}
              page={page}
              search={search}
              refresh={refresh}
              nav={nav}
              active={active}
            />
          )}
        </RemotePane>
      </Page>
    );
  };
});

function LabListContent({
  result,
  route,
  page,
  search,
  refresh,
  nav,
  active,
}: {
  readonly result: { readonly view: unknown };
  readonly route: Extract<Route, { name: "labList" }>;
  readonly page: number;
  readonly search: string;
  readonly refresh: number;
  readonly nav: Navigator;
  readonly active: boolean;
}) {
  const view = asRecord(result.view);
  const assignments = asRecord(view["assignments"]);
  const entries = Object.entries(assignments);
  const [selected, setSelected] = useSelectedIndex(entries.length, `lab-list:${page}:${search}:${refresh}`);
  const items = entries.map(([id, homework]) => {
    const record = asRecord(homework);
    const progress = asRecord(record["progress"]);

    return {
      id,
      label: stringValue(record["name"], id),
      description: `${stringValue(record["status"])}  ${stringValue(record["statusTime"])}`,
      meta: `${optionalText(progress["finished"]) ?? "-"}/${optionalText(progress["total"]) ?? "-"}  assignment ${id}`,
    };
  });

  return (
    <Box flexDirection="column">
      <FieldList
        fields={[
          ["page", page],
          ["total", view["total"]],
          ["category", asRecord(view["category"])["name"]],
        ]}
      />
      <Box marginTop={1}>
        <SelectList
          items={items}
          selected={selected}
          onSelectedChange={setSelected}
          onOpen={(item) => {
            nav.push({
              name: "labDetail",
              courseId: route.courseId,
              courseName: route.courseName,
              homeworkId: item.id,
              homeworkName: item.label,
            });
          }}
          active={active}
          empty="No lab assignments found."
        />
      </Box>
    </Box>
  );
}

export const LabDetailPage = Effect.gen(function* () {
  const labAssignment = yield* LabAssignmentFeature;

  return function LabDetailPage({ route, nav, ui, active }: PageProps<Extract<Route, { name: "labDetail" }>>) {
    const [taskId, setTaskId] = useState(route.taskId ?? "");
    const items: ReadonlyArray<SelectItem> = [
      { id: "task", label: "Task info", description: "Challenge, environments and test sets" },
      { id: "repository", label: "Repository", description: "Browse repository files and directories" },
      { id: "remaining", label: "Remaining time", description: "Runtime/container time left" },
      { id: "logs", label: "Logs", description: "Fetch terminal or build logs" },
      { id: "passed", label: "Passed code", description: "Fetch latest accepted code for one file" },
      { id: "edit", label: "Edit file", description: "Open file in $VISUAL/$EDITOR and save back" },
      { id: "save", label: "Save file", description: "Upload local file content to a repository path" },
      { id: "evaluate", label: "Evaluate file", description: "Upload, build and optionally poll result" },
      { id: "build", label: "Build", description: "Build an already saved snapshot by sec key and commit id" },
      { id: "status", label: "Evaluation status", description: "Check result by sec key" },
      { id: "commit", label: "Commit files", description: "Commit current environment changes" },
      { id: "pull", label: "Pull files", description: "Pull repository files into runtime" },
      { id: "ssh", label: "SSH", description: "Start SSH session when available" },
      { id: "reset", label: "Reset repository", description: "Discard edits and reset initial state" },
      { id: "prune", label: "Prune snapshots", description: "Clean expired repository snapshots" },
    ];

    const resolveTaskId = async () => {
      if (taskId.length >= 1) {
        return taskId;
      }

      const result = await ui.runAction(
        "Resolve lab task",
        labAssignment.resolveTask({
          courseId: route.courseId,
          homeworkId: route.homeworkId,
        }),
      );
      const value = stringValue(asRecord(result?.view)["taskId"]);

      if (value.length >= 1) {
        setTaskId(value);
        return value;
      }

      return null;
    };

    const readLocalContent = async () => {
      const file = await askRequired(ui, "Local file", "path");

      if (file === null) {
        return null;
      }

      try {
        return await readUtf8File(file);
      } catch (error) {
        ui.showError("Local file", error);

        return null;
      }
    };

    const promptRepositoryPath = () => askRequired(ui, "Repository path", "path");

    const editFile = async () => {
      const path = await promptRepositoryPath();

      if (path === null) {
        return;
      }

      await ui.runAction(
        "Edit repository file",
        Effect.gen(function* () {
          const current = yield* labAssignment.getRepositoryContent({
            courseId: route.courseId,
            homeworkId: route.homeworkId,
            path,
            exerciseId: "",
          });
          const edited = yield* Effect.promise(() =>
            editInExternalEditor(path, stringValue(asRecord(current.view)["decodedContent"])),
          );

          if (edited.content === stringValue(asRecord(current.view)["decodedContent"])) {
            yield* Effect.promise(() => cleanupEditedContent(edited));
            return { edit: { editor: edited.editor, changed: false } };
          }

          const confirmed = yield* Effect.promise(() =>
            ui.danger("Save edited file", `Upload edited content to ${path}.`, path),
          );

          if (!confirmed) {
            return { edit: { editor: edited.editor, changed: true, saved: false, file: edited.file } };
          }

          const saved = yield* labAssignment.saveRepositoryFile({
            courseId: route.courseId,
            homeworkId: route.homeworkId,
            path,
            content: edited.content,
            evaluate: false,
            tabType: 1,
          });

          yield* Effect.promise(() => cleanupEditedContent(edited));

          return { edit: { editor: edited.editor, changed: true }, save: saved.view };
        }),
      );
    };

    const run = async (id: string) => {
      if (id === "task") {
        await ui.runAction(
          "Lab task",
          labAssignment.getTask({ courseId: route.courseId, homeworkId: route.homeworkId }),
        );
        return;
      }

      if (id === "repository") {
        const currentTaskId = await resolveTaskId();

        if (currentTaskId === null) {
          return;
        }

        nav.push({
          name: "repository",
          courseId: route.courseId,
          courseName: route.courseName,
          homeworkId: route.homeworkId,
          homeworkName: route.homeworkName,
          taskId: currentTaskId,
          path: "",
        });
        return;
      }

      if (id === "remaining") {
        await ui.runAction(
          "Remaining time",
          labAssignment.getRemainingTime({ courseId: route.courseId, homeworkId: route.homeworkId }),
        );
        return;
      }

      if (id === "logs") {
        await ui.runAction(
          "Lab logs",
          labAssignment.getLogs({
            courseId: route.courseId,
            homeworkId: route.homeworkId,
            tabType: 1,
          }),
        );
        return;
      }

      if (id === "passed") {
        const path = await promptRepositoryPath();

        if (path !== null) {
          await ui.runAction(
            "Passed code",
            labAssignment.getPassedCode({ courseId: route.courseId, homeworkId: route.homeworkId, path }),
          );
        }

        return;
      }

      if (id === "edit") {
        await editFile();
        return;
      }

      if (id === "save") {
        const path = await promptRepositoryPath();
        const content = path === null ? null : await readLocalContent();

        if (path !== null && content !== null) {
          const confirmed = await ui.danger("Save repository file", `Upload local content to ${path}.`, path);

          if (confirmed) {
            await ui.runAction(
              "Save repository file",
              labAssignment.saveRepositoryFile({
                courseId: route.courseId,
                homeworkId: route.homeworkId,
                path,
                content,
                evaluate: false,
                tabType: 1,
              }),
            );
          }
        }

        return;
      }

      if (id === "evaluate") {
        const path = await promptRepositoryPath();
        const content = path === null ? null : await readLocalContent();

        if (path !== null && content !== null) {
          const pollLimit = nonNegativeNumber(
            (await ui.prompt("Poll attempts", "0 disables polling, default 20", "20")) ?? "20",
            20,
          );
          const confirmed = await ui.danger("Evaluate repository file", `Upload and evaluate ${path}.`, path);

          if (confirmed) {
            await ui.runAction(
              "Evaluate repository file",
              labAssignment.evaluateRepositoryFile({
                courseId: route.courseId,
                homeworkId: route.homeworkId,
                path,
                content,
                tabType: 1,
                poll: pollLimit > 0,
                pollInterval: 2,
                pollLimit,
                onRunning: ({ attempt, limit, response }) => {
                  return Effect.sync(() =>
                    ui.setBusy("Evaluate repository file", `[${attempt}/${limit}] ${renderResult(response)}`),
                  );
                },
              }),
            );
          }
        }

        return;
      }

      if (id === "build") {
        const secKey = await askRequired(ui, "Build", "sec-key");
        const commitId = secKey === null ? null : await askRequired(ui, "Build", "commit-id");

        if (secKey !== null && commitId !== null) {
          const confirmed = await ui.danger("Build repository snapshot", `Build commit ${commitId}.`, commitId);

          if (confirmed) {
            await ui.runAction(
              "Build repository snapshot",
              labAssignment.buildRepositoryFile({
                courseId: route.courseId,
                homeworkId: route.homeworkId,
                secKey,
                commitId,
                contentModified: 0,
                resubmit: "",
                tabType: 1,
              }),
            );
          }
        }

        return;
      }

      if (id === "status") {
        const secKey = await askRequired(ui, "Evaluation status", "sec-key");

        if (secKey !== null) {
          await ui.runAction(
            "Evaluation status",
            labAssignment.getEvaluationStatus({
              courseId: route.courseId,
              homeworkId: route.homeworkId,
              secKey,
              resubmit: "",
              timeOut: false,
              port: 0,
              subjectId: "",
            }),
          );
        }

        return;
      }

      if (id === "commit") {
        const confirmed = await ui.danger(
          "Commit files",
          `Commit current environment for assignment ${route.homeworkId}.`,
          route.homeworkId,
        );

        if (confirmed) {
          await ui.runAction(
            "Commit files",
            labAssignment.commitFiles({ courseId: route.courseId, homeworkId: route.homeworkId }),
          );
        }

        return;
      }

      if (id === "pull") {
        const confirmed = await ui.danger(
          "Pull files",
          `Pull runtime files for assignment ${route.homeworkId}.`,
          route.homeworkId,
        );

        if (confirmed) {
          await ui.runAction(
            "Pull files",
            labAssignment.pullFiles({ courseId: route.courseId, homeworkId: route.homeworkId }),
          );
        }

        return;
      }

      if (id === "ssh") {
        const confirmed = await ui.danger(
          "Start SSH",
          `Open SSH session for assignment ${route.homeworkId}.`,
          route.homeworkId,
        );

        if (confirmed) {
          await ui.runAction(
            "SSH",
            Effect.gen(function* () {
              const result = yield* labAssignment.startSsh({
                courseId: route.courseId,
                homeworkId: route.homeworkId,
                tabType: 4,
              });
              const args = asRecord(result.view)["sshArgs"];

              if (Array.isArray(args)) {
                yield* Effect.promise(() => runSsh(args.map((item) => String(item))));
                return { ssh: args };
              }

              return result.view;
            }),
          );
        }

        return;
      }

      if (id === "reset") {
        const confirmed = await ui.danger("Reset repository", "This discards repository edits.", route.homeworkId);

        if (confirmed) {
          await ui.runAction(
            "Reset repository",
            labAssignment.resetRepository({ courseId: route.courseId, homeworkId: route.homeworkId }),
          );
        }

        return;
      }

      const confirmed = await ui.danger(
        "Prune snapshots",
        "This cleans expired repository snapshots.",
        route.homeworkId,
      );

      if (confirmed) {
        await ui.runAction(
          "Prune snapshots",
          labAssignment.pruneRepository({ courseId: route.courseId, homeworkId: route.homeworkId }),
        );
      }
    };

    useInput(
      (input) => {
        if (input === "t") {
          void resolveTaskId();
        }
      },
      { isActive: active },
    );

    return (
      <MenuPage
        title={route.homeworkName}
        subtitle={`lab assignment ${route.homeworkId}  task ${taskId || "auto"}`}
        items={items}
        active={active}
        footer="Enter open  t resolve task-id  Esc back  q quit"
        onOpen={(item) => void run(item.id)}
      />
    );
  };
});

export const RepositoryPage = Effect.gen(function* () {
  const labAssignment = yield* LabAssignmentFeature;

  return function RepositoryPage({ route, nav, ui, active }: PageProps<Extract<Route, { name: "repository" }>>) {
    const data = useRemoteData(`repo:${route.taskId}:${route.homeworkId}:${route.path}`, () =>
      labAssignment.listRepository({
        courseId: route.courseId,
        taskId: route.taskId,
        homeworkId: route.homeworkId,
        path: route.path.length >= 1 ? route.path : undefined,
      }),
    );

    useInput(
      (input) => {
        if (input === "j") {
          void Effect.runPromise(
            labAssignment.listRepository({
              courseId: route.courseId,
              taskId: route.taskId,
              homeworkId: route.homeworkId,
              path: route.path.length >= 1 ? route.path : undefined,
            }),
          ).then(
            (result) => ui.showJson("Repository JSON", result.raw),
            (error: unknown) => ui.showError("Repository", error),
          );
        }
      },
      { isActive: active },
    );

    return (
      <Page
        title="Repository"
        subtitle={`${route.homeworkName}  ${route.path || "."}`}
        footer="Enter open  j JSON  Esc back  q quit"
      >
        <RemotePane data={data}>
          {(result) => <RepositoryContent result={result} route={route} nav={nav} active={active} />}
        </RemotePane>
      </Page>
    );
  };
});

function RepositoryContent({
  result,
  route,
  nav,
  active,
}: {
  readonly result: { readonly view: unknown };
  readonly route: Extract<Route, { name: "repository" }>;
  readonly nav: Navigator;
  readonly active: boolean;
}) {
  const repository = asRecord(asRecord(result.view)["repository"]);
  const entries = objectEntries(repository["entries"]);
  const [selected, setSelected] = useSelectedIndex(entries.length, `repo-list:${route.path}`);
  const items = entries.map(([name, entry]) => {
    const record = asRecord(entry);

    return {
      id: name,
      label: name,
      description: stringValue(record["path"]),
      meta: stringValue(record["type"]),
    };
  });

  return (
    <SelectList
      items={items}
      selected={selected}
      onSelectedChange={setSelected}
      onOpen={(item) => {
        const entry = selectedRecord(asRecord(repository["entries"]), item.id);
        const path = stringValue(entry["path"], item.label);
        const type = stringValue(entry["type"]);

        if (type === "tree" || type === "dir" || type === "directory") {
          nav.push({ ...route, path });
          return;
        }

        nav.push({ ...route, name: "file", path });
      }}
      active={active}
      empty="No repository entries found."
    />
  );
}

export const FilePage = Effect.gen(function* () {
  const labAssignment = yield* LabAssignmentFeature;

  return function FilePage({ route, ui, active }: PageProps<Extract<Route, { name: "file" }>>) {
    const [refresh, setRefresh] = useState(0);
    const data = useRemoteData(`file:${route.taskId}:${route.homeworkId}:${route.path}:${refresh}`, () =>
      labAssignment.getRepositoryContent({
        courseId: route.courseId,
        taskId: route.taskId,
        homeworkId: route.homeworkId,
        path: route.path,
        exerciseId: "",
      }),
    );

    const edit = async () => {
      if (data.tag !== "success") {
        return;
      }

      await ui.runAction(
        "Edit repository file",
        Effect.gen(function* () {
          const current = stringValue(asRecord(data.value.view)["decodedContent"]);
          const edited = yield* Effect.promise(() => editInExternalEditor(route.path, current));

          if (edited.content === current) {
            yield* Effect.promise(() => cleanupEditedContent(edited));
            return { edit: { editor: edited.editor, changed: false } };
          }

          const confirmed = yield* Effect.promise(() =>
            ui.danger("Save edited file", `Upload edited content to ${route.path}.`, route.path),
          );

          if (!confirmed) {
            return { edit: { editor: edited.editor, changed: true, saved: false, file: edited.file } };
          }

          const saved = yield* labAssignment.saveRepositoryFile({
            courseId: route.courseId,
            taskId: route.taskId,
            homeworkId: route.homeworkId,
            path: route.path,
            content: edited.content,
            evaluate: false,
            tabType: 1,
          });

          yield* Effect.promise(() => cleanupEditedContent(edited));
          yield* Effect.sync(() => setRefresh((value) => value + 1));

          return { edit: { editor: edited.editor, changed: true }, save: saved.view };
        }),
      );
    };

    useInput(
      (input) => {
        if (input === "e") {
          void edit();
          return;
        }

        if (input === "j" && data.tag === "success") {
          ui.showJson("Repository file JSON", data.value.raw);
        }
      },
      { isActive: active },
    );

    return (
      <Page title={route.path} subtitle={route.homeworkName} footer="e edit  j raw JSON  Esc back  q quit">
        <RemotePane data={data}>
          {(result) => <JsonBlock value={stringValue(asRecord(result.view)["decodedContent"])} />}
        </RemotePane>
      </Page>
    );
  };
});
