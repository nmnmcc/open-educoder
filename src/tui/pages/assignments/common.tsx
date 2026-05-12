import { Effect } from "effect";
import { Box, useInput } from "ink";
import { useState } from "react";

import { CommonAssignmentFeature } from "../../../services/features/assignments/common.js";
import type { Navigator, PageProps, Route } from "../../app/types.js";
import { MenuPage } from "../../components/MenuPage.js";
import {
  FieldList,
  Page,
  RemotePane,
  type SelectItem,
  SelectList,
  asRecord,
  booleanValue,
  optionalText,
  stringValue,
  useRemoteData,
  useSelectedIndex,
} from "../../ui/index.js";

export const CommonListPage = Effect.gen(function* () {
  const commonAssignment = yield* CommonAssignmentFeature;

  return function CommonListPage({ route, nav, ui, active }: PageProps<Extract<Route, { name: "commonList" }>>) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [refresh, setRefresh] = useState(0);
    const data = useRemoteData(`common:${route.courseId}:${page}:${search}:${refresh}`, () =>
      commonAssignment.list({
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
          void ui.prompt("Search common assignments", "keyword", search).then((value) => {
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
        title="Common Assignments"
        subtitle={`${route.courseName}  search "${search}"`}
        footer="Enter open  / search  n/p page  r refresh  Esc back  q quit"
      >
        <RemotePane data={data}>
          {(result) => (
            <CommonListContent
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

function CommonListContent({
  result,
  route,
  page,
  search,
  refresh,
  nav,
  active,
}: {
  readonly result: { readonly view: unknown };
  readonly route: Extract<Route, { name: "commonList" }>;
  readonly page: number;
  readonly search: string;
  readonly refresh: number;
  readonly nav: Navigator;
  readonly active: boolean;
}) {
  const view = asRecord(result.view);
  const assignments = asRecord(view["assignments"]);
  const entries = Object.entries(assignments);
  const [selected, setSelected] = useSelectedIndex(entries.length, `common-list:${page}:${search}:${refresh}`);
  const items = entries.map(([id, homework]) => {
    const record = asRecord(homework);

    return {
      id,
      label: stringValue(record["name"], id),
      description: `${stringValue(record["status"])}  ${stringValue(record["statusTime"])}`,
      meta: `work ${optionalText(record["workStatus"]) ?? "-"}  late ${booleanValue(record["allowLate"])}`,
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
          onOpen={(item) =>
            nav.push({
              name: "commonDetail",
              courseId: route.courseId,
              courseName: route.courseName,
              homeworkId: item.id,
              homeworkName: item.label,
            })
          }
          active={active}
          empty="No common assignments found."
        />
      </Box>
    </Box>
  );
}

export const CommonDetailPage = Effect.gen(function* () {
  const commonAssignment = yield* CommonAssignmentFeature;

  return function CommonDetailPage({ route, ui, active }: PageProps<Extract<Route, { name: "commonDetail" }>>) {
    const items: ReadonlyArray<SelectItem> = [
      { id: "info", label: "Info", description: "Metadata, instructions and attachments" },
      { id: "work", label: "Work", description: "Your score and submit state" },
      { id: "draft", label: "Draft", description: "Current draft context" },
      { id: "members", label: "Members", description: "Search member submission status" },
      { id: "comments", label: "Comments", description: "Discussion comments" },
      { id: "settings", label: "Settings", description: "Deadline, scoring and visibility rules" },
      { id: "redo", label: "Redo logs", description: "Redo history" },
    ];

    const run = async (id: string) => {
      if (id === "info") {
        await ui.runAction("Common assignment info", commonAssignment.getInfo({ homeworkId: route.homeworkId }));
        return;
      }

      if (id === "work") {
        await ui.runAction(
          "Common assignment work",
          commonAssignment.getWork({ courseId: route.courseId, homeworkId: route.homeworkId }),
        );
        return;
      }

      if (id === "draft") {
        await ui.runAction(
          "Common assignment draft",
          commonAssignment.getDraft({ courseId: route.courseId, homeworkId: route.homeworkId, type: 3 }),
        );
        return;
      }

      if (id === "members") {
        const search = (await ui.prompt("Search members", "keyword", "")) ?? "";

        await ui.runAction(
          "Common assignment members",
          commonAssignment.searchMembers({
            courseId: route.courseId,
            homeworkId: route.homeworkId,
            page: 1,
            limit: 20,
            search,
          }),
        );
        return;
      }

      if (id === "comments") {
        await ui.runAction(
          "Common assignment comments",
          commonAssignment.getComments({ courseId: route.courseId, homeworkId: route.homeworkId, pageSize: 10 }),
        );
        return;
      }

      if (id === "settings") {
        await ui.runAction(
          "Common assignment settings",
          commonAssignment.getSettings({ courseId: route.courseId, homeworkId: route.homeworkId }),
        );
        return;
      }

      await ui.runAction(
        "Common assignment redo logs",
        commonAssignment.getRedoLogs({ homeworkId: route.homeworkId, type: 2, page: 1, limit: 10 }),
      );
    };

    return (
      <MenuPage
        title={route.homeworkName}
        subtitle={`common assignment ${route.homeworkId}`}
        items={items}
        active={active}
        onOpen={(item) => void run(item.id)}
      />
    );
  };
});
