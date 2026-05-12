import { Effect } from "effect";
import { Box, useApp, useInput } from "ink";
import { useState } from "react";

import { CourseInfoPage, CoursesPage, ModulesPage } from "../pages/course.js";
import { ExamDetailPage, ExamShowPage, ExamsPage } from "../pages/exams.js";
import { CommonDetailPage, CommonListPage } from "../pages/homeworks/common.js";
import { FilePage, RepositoryPage, ShixunDetailPage, ShixunListPage } from "../pages/homeworks/shixun.js";
import { formatError } from "../runtime/process.js";
import { OverlayPane } from "./overlay.js";
import { renderRoute } from "./router.js";
import type { AppComponents, Navigator, Overlay, Route, UiActions } from "./types.js";

export const TuiApp = Effect.gen(function* () {
  const CoursesPageComponent = yield* CoursesPage;
  const CourseInfoPageComponent = yield* CourseInfoPage;
  const ModulesPageComponent = yield* ModulesPage;
  const CommonListPageComponent = yield* CommonListPage;
  const CommonDetailPageComponent = yield* CommonDetailPage;
  const ShixunListPageComponent = yield* ShixunListPage;
  const ShixunDetailPageComponent = yield* ShixunDetailPage;
  const RepositoryPageComponent = yield* RepositoryPage;
  const FilePageComponent = yield* FilePage;
  const ExamsPageComponent = yield* ExamsPage;
  const ExamDetailPageComponent = yield* ExamDetailPage;
  const ExamShowPageComponent = yield* ExamShowPage;
  const components: AppComponents = {
    CoursesPage: CoursesPageComponent,
    CourseInfoPage: CourseInfoPageComponent,
    ModulesPage: ModulesPageComponent,
    CommonListPage: CommonListPageComponent,
    CommonDetailPage: CommonDetailPageComponent,
    ShixunListPage: ShixunListPageComponent,
    ShixunDetailPage: ShixunDetailPageComponent,
    RepositoryPage: RepositoryPageComponent,
    FilePage: FilePageComponent,
    ExamsPage: ExamsPageComponent,
    ExamDetailPage: ExamDetailPageComponent,
    ExamShowPage: ExamShowPageComponent,
  };

  return function App() {
    const app = useApp();
    const [routes, setRoutes] = useState<ReadonlyArray<Route>>([{ name: "courses" }]);
    const [overlay, setOverlay] = useState<Overlay | null>(null);
    const current = routes.at(-1) ?? { name: "courses" as const };

    const nav: Navigator = {
      push: (route) => setRoutes((value) => [...value, route]),
      replace: (route) => setRoutes((value) => [...value.slice(0, -1), route]),
      back: () =>
        setRoutes((value) => {
          if (value.length <= 1) {
            app.exit();
            return value;
          }

          return value.slice(0, -1);
        }),
    };

    const ui: UiActions = {
      prompt: (title, label, initialValue = "") =>
        new Promise((resolve) => setOverlay({ type: "prompt", title, label, initialValue, resolve })),
      danger: (title, message, expected) =>
        new Promise((resolve) => setOverlay({ type: "danger", title, message, expected, resolve })),
      showError: (title, error) => setOverlay({ type: "message", title, message: formatError(error), tone: "error" }),
      showJson: (title, value) => nav.push({ name: "json", title, value }),
      runAction: async (title, action, success) => {
        setOverlay({ type: "busy", title, message: "Running..." });

        try {
          const value = await Effect.runPromise(action);

          setOverlay({
            type: "message",
            title,
            message: "Done.",
            value: success === undefined ? value : success(value),
            tone: "info",
          });

          return value;
        } catch (error) {
          setOverlay({ type: "message", title, message: formatError(error), tone: "error" });

          return null;
        }
      },
      setBusy: (title, message) => setOverlay({ type: "busy", title, message }),
    };

    useInput(
      (input, key) => {
        if (input === "q") {
          app.exit();
          return;
        }

        if (key.escape || key.backspace) {
          nav.back();
        }
      },
      { isActive: overlay === null },
    );

    return (
      <Box flexDirection="column" height="100%">
        <Box flexDirection="column" flexGrow={1}>
          {renderRoute(current, components, nav, ui, overlay === null)}
        </Box>
        {overlay !== null ? <OverlayPane overlay={overlay} close={() => setOverlay(null)} /> : null}
      </Box>
    );
  };
});
