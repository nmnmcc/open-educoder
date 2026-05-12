import { Effect } from "effect";
import { Box, Text, useInput } from "ink";
import { useState } from "react";

import { AppContext } from "../../services/context/index.js";
import { CourseFeature } from "../../services/features/course.js";
import type { Navigator, PageProps, Route } from "../app/types.js";
import { MenuPage } from "../components/MenuPage.js";
import {
  FieldList,
  KeyHints,
  Page,
  RemotePane,
  type SelectItem,
  SelectList,
  asRecord,
  numberValue,
  objectEntries,
  optionalText,
  stringValue,
  useRemoteData,
  useSelectedIndex,
} from "../ui/index.js";

export const CoursesPage = Effect.gen(function* () {
  const context = yield* AppContext;
  const course = yield* CourseFeature;

  return function CoursesPage({ nav, active }: PageProps<Extract<Route, { name: "courses" }>>) {
    const [page, setPage] = useState(1);
    const [refresh, setRefresh] = useState(0);
    const data = useRemoteData(`courses:${page}:${refresh}`, () =>
      Effect.gen(function* () {
        const user = yield* context.user;
        const courses = yield* course.list({
          status: "processing",
          page,
          perPage: 15,
          sortBy: "updated_at",
          sortDirection: "desc",
          category: "",
        });

        return { user, courses };
      }),
    );

    useInput(
      (input) => {
        if (input === "r") {
          setRefresh((value) => value + 1);
          return;
        }

        if (input === "n") {
          setPage((value) => value + 1);
          return;
        }

        if (input === "p") {
          setPage((value) => Math.max(1, value - 1));
        }
      },
      { isActive: active },
    );

    return (
      <Page
        title="Open Educoder"
        subtitle={`profile ${context.profile}  ${context.url}`}
        footer="Enter open  n/p page  r refresh  Esc back  q quit"
      >
        <RemotePane data={data}>
          {(value) => <CoursesContent value={value} page={page} refresh={refresh} nav={nav} active={active} />}
        </RemotePane>
      </Page>
    );
  };
});

function CoursesContent({
  value,
  page,
  refresh,
  nav,
  active,
}: {
  readonly value: { readonly user: unknown; readonly courses: { readonly view: unknown } };
  readonly page: number;
  readonly refresh: number;
  readonly nav: Navigator;
  readonly active: boolean;
}) {
  const view = asRecord(value.courses.view);
  const entries = objectEntries(view["courses"]);
  const [selected, setSelected] = useSelectedIndex(entries.length, `courses-list:${page}:${refresh}`);
  const items = entries.map(([id, course]) => {
    const record = asRecord(course);

    return {
      id,
      label: stringValue(record["name"], id),
      description: `${stringValue(record["school"])}  ${stringValue(record["teacher"])}`,
      meta: `${optionalText(record["status"]) ?? "-"}  ${numberValue(record["homeworks"])} homework`,
    };
  });

  return (
    <Box flexDirection="column">
      <FieldList
        fields={[
          ["user", stringValue(asRecord(value.user)["login"], "-")],
          ["page", page],
          ["total", numberValue(view["total"])],
        ]}
      />
      <Box marginTop={1}>
        <SelectList
          items={items}
          selected={selected}
          onSelectedChange={setSelected}
          onOpen={(item) => nav.push({ name: "course", courseId: item.id, courseName: item.label })}
          active={active}
          empty="No courses found."
        />
      </Box>
    </Box>
  );
}

export function CoursePage({ route, nav, active }: PageProps<Extract<Route, { name: "course" }>>) {
  const items: ReadonlyArray<SelectItem> = [
    { id: "info", label: "Course info", description: "Teacher, counts, visibility, invite code" },
    { id: "modules", label: "Modules", description: "Course module and category structure" },
    { id: "common", label: "Common homeworks", description: "Assignments, work status, comments and settings" },
    { id: "shixun", label: "Shixun homeworks", description: "Task, repository, evaluation and environment actions" },
    { id: "exams", label: "Exams", description: "List, start, answer, show and submit exams" },
  ];

  return (
    <MenuPage
      title={route.courseName}
      subtitle={`course ${route.courseId}`}
      items={items}
      active={active}
      onOpen={(item) => {
        if (item.id === "info") {
          nav.push({ name: "courseInfo", courseId: route.courseId, courseName: route.courseName });
          return;
        }

        if (item.id === "modules") {
          nav.push({ name: "modules", courseId: route.courseId, courseName: route.courseName });
          return;
        }

        if (item.id === "common") {
          nav.push({ name: "commonList", courseId: route.courseId, courseName: route.courseName });
          return;
        }

        if (item.id === "shixun") {
          nav.push({ name: "shixunList", courseId: route.courseId, courseName: route.courseName });
          return;
        }

        nav.push({ name: "exams", courseId: route.courseId, courseName: route.courseName });
      }}
    />
  );
}

export const CourseInfoPage = Effect.gen(function* () {
  const course = yield* CourseFeature;

  return function CourseInfoPage({ route, ui, active }: PageProps<Extract<Route, { name: "courseInfo" }>>) {
    const data = useRemoteData(`course-info:${route.courseId}`, () => course.getInfo({ courseId: route.courseId }));

    return (
      <Page
        title="Course Info"
        subtitle={`${route.courseName}  ${route.courseId}`}
        footer="j raw JSON  Esc back  q quit"
      >
        <RemotePane data={data}>
          {(result) => {
            const course = asRecord(asRecord(result.view)["course"]);

            return (
              <Box flexDirection="column">
                <CourseInfoKeys active={active} onJson={() => ui.showJson("Course info JSON", result.raw)} />
                <FieldList
                  fields={[
                    ["name", course["name"]],
                    ["teacher", course["teacher"]],
                    ["teacher school", course["teacherSchool"]],
                    ["group", course["group"]],
                    ["students", course["studentCount"]],
                    ["teachers", course["teacherCount"]],
                    ["groups", course["groupCount"]],
                    ["credit", course["credit"]],
                    ["class period", course["classPeriod"]],
                    ["visits", course["visits"]],
                    ["public", course["public"]],
                    ["ended", course["ended"]],
                    ["invite code", course["inviteCode"]],
                  ]}
                />
              </Box>
            );
          }}
        </RemotePane>
      </Page>
    );
  };
});

function CourseInfoKeys({ active, onJson }: { readonly active: boolean; readonly onJson: () => void }) {
  useInput(
    (input) => {
      if (input === "j") {
        onJson();
      }
    },
    { isActive: active },
  );

  return <KeyHints hints={["j JSON"]} />;
}

export const ModulesPage = Effect.gen(function* () {
  const course = yield* CourseFeature;

  return function ModulesPage({ route, ui, active }: PageProps<Extract<Route, { name: "modules" }>>) {
    const data = useRemoteData(`modules:${route.courseId}`, () => course.listModules({ courseId: route.courseId }));

    useInput(
      (input) => {
        if (input === "j") {
          void Effect.runPromise(course.listModules({ courseId: route.courseId })).then(
            (result) => ui.showJson("Modules JSON", result.raw),
            (error: unknown) => ui.showError("Modules JSON", error),
          );
        }
      },
      { isActive: active },
    );

    return (
      <Page title="Modules" subtitle={`${route.courseName}  ${route.courseId}`} footer="j raw JSON  Esc back  q quit">
        <RemotePane data={data}>
          {(result) => {
            const modules = objectEntries(asRecord(result.view)["modules"]);

            return modules.length < 1 ? (
              <Text dimColor>No modules found.</Text>
            ) : (
              <Box flexDirection="column">
                {modules.map(([id, module]) => {
                  const record = asRecord(module);
                  const categories = objectEntries(record["categories"]);

                  return (
                    <Box key={id} flexDirection="column" marginBottom={1}>
                      <Text bold color="cyan">
                        {stringValue(record["name"], id)}
                      </Text>
                      <Text dimColor>
                        {stringValue(record["type"])} position {optionalText(record["position"]) ?? "-"}
                      </Text>
                      {categories.map(([categoryId, category]) => (
                        <Text key={categoryId}>
                          {"  "}- {stringValue(asRecord(category)["name"], categoryId)}
                        </Text>
                      ))}
                    </Box>
                  );
                })}
              </Box>
            );
          }}
        </RemotePane>
      </Page>
    );
  };
});
