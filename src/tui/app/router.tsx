import { CoursePage } from "../pages/course.js";
import { JsonBlock, Page } from "../ui/index.js";
import type { AppComponents, Navigator, PageProps, Route, UiActions } from "./types.js";

function JsonPage({ route }: PageProps<Extract<Route, { name: "json" }>>) {
  return (
    <Page title={route.title} footer="Esc back  q quit">
      <JsonBlock value={route.value} />
    </Page>
  );
}

export function renderRoute(route: Route, components: AppComponents, nav: Navigator, ui: UiActions, active: boolean) {
  const {
    CoursesPage,
    CourseInfoPage,
    ModulesPage,
    CommonListPage,
    CommonDetailPage,
    LabListPage,
    LabDetailPage,
    RepositoryPage,
    FilePage,
    ExamsPage,
    ExamDetailPage,
    ExamShowPage,
  } = components;

  switch (route.name) {
    case "courses":
      return <CoursesPage route={route} nav={nav} ui={ui} active={active} />;
    case "course":
      return <CoursePage route={route} nav={nav} ui={ui} active={active} />;
    case "courseInfo":
      return <CourseInfoPage route={route} nav={nav} ui={ui} active={active} />;
    case "modules":
      return <ModulesPage route={route} nav={nav} ui={ui} active={active} />;
    case "commonList":
      return <CommonListPage route={route} nav={nav} ui={ui} active={active} />;
    case "commonDetail":
      return <CommonDetailPage route={route} nav={nav} ui={ui} active={active} />;
    case "labList":
      return <LabListPage route={route} nav={nav} ui={ui} active={active} />;
    case "labDetail":
      return <LabDetailPage route={route} nav={nav} ui={ui} active={active} />;
    case "repository":
      return <RepositoryPage route={route} nav={nav} ui={ui} active={active} />;
    case "file":
      return <FilePage route={route} nav={nav} ui={ui} active={active} />;
    case "exams":
      return <ExamsPage route={route} nav={nav} ui={ui} active={active} />;
    case "examDetail":
      return <ExamDetailPage route={route} nav={nav} ui={ui} active={active} />;
    case "examShow":
      return <ExamShowPage route={route} nav={nav} ui={ui} active={active} />;
    case "json":
      return <JsonPage route={route} nav={nav} ui={ui} active={active} />;
  }
}
