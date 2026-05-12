import type { Effect } from "effect";
import type { FC } from "react";

export type Route =
  | { readonly name: "courses" }
  | { readonly name: "course"; readonly courseId: string; readonly courseName: string }
  | { readonly name: "courseInfo"; readonly courseId: string; readonly courseName: string }
  | { readonly name: "modules"; readonly courseId: string; readonly courseName: string }
  | { readonly name: "commonList"; readonly courseId: string; readonly courseName: string }
  | {
      readonly name: "commonDetail";
      readonly courseId: string;
      readonly courseName: string;
      readonly homeworkId: string;
      readonly homeworkName: string;
    }
  | { readonly name: "shixunList"; readonly courseId: string; readonly courseName: string }
  | {
      readonly name: "shixunDetail";
      readonly courseId: string;
      readonly courseName: string;
      readonly homeworkId: string;
      readonly homeworkName: string;
      readonly taskId?: string | undefined;
    }
  | {
      readonly name: "repository";
      readonly courseId: string;
      readonly courseName: string;
      readonly homeworkId: string;
      readonly homeworkName: string;
      readonly taskId: string;
      readonly path: string;
    }
  | {
      readonly name: "file";
      readonly courseId: string;
      readonly courseName: string;
      readonly homeworkId: string;
      readonly homeworkName: string;
      readonly taskId: string;
      readonly path: string;
    }
  | { readonly name: "exams"; readonly courseId: string; readonly courseName: string }
  | {
      readonly name: "examDetail";
      readonly courseId: string;
      readonly courseName: string;
      readonly examId: number;
      readonly examName: string;
      readonly started: boolean;
    }
  | {
      readonly name: "examShow";
      readonly courseId: string;
      readonly courseName: string;
      readonly examId: number;
      readonly examName: string;
    }
  | { readonly name: "json"; readonly title: string; readonly value: unknown };

export type Overlay =
  | {
      readonly type: "prompt";
      readonly title: string;
      readonly label: string;
      readonly initialValue: string;
      readonly resolve: (value: string | null) => void;
    }
  | {
      readonly type: "danger";
      readonly title: string;
      readonly message: string;
      readonly expected: string;
      readonly resolve: (value: boolean) => void;
    }
  | {
      readonly type: "busy";
      readonly title: string;
      readonly message: string;
    }
  | {
      readonly type: "message";
      readonly title: string;
      readonly message?: string | undefined;
      readonly value?: unknown;
      readonly tone: "info" | "error";
    };

export type Navigator = {
  readonly push: (route: Route) => void;
  readonly replace: (route: Route) => void;
  readonly back: () => void;
};

export type UiActions = {
  readonly prompt: (title: string, label: string, initialValue?: string) => Promise<string | null>;
  readonly danger: (title: string, message: string, expected: string) => Promise<boolean>;
  readonly showError: (title: string, error: unknown) => void;
  readonly showJson: (title: string, value: unknown) => void;
  readonly runAction: <A, E>(
    title: string,
    action: Effect.Effect<A, E>,
    success?: (value: A) => unknown,
  ) => Promise<A | null>;
  readonly setBusy: (title: string, message: string) => void;
};

export type PageProps<R extends Route> = {
  readonly route: R;
  readonly nav: Navigator;
  readonly ui: UiActions;
  readonly active: boolean;
};

type PageComponent<R extends Route> = FC<PageProps<R>>;

export type AppComponents = {
  readonly CoursesPage: PageComponent<Extract<Route, { name: "courses" }>>;
  readonly CourseInfoPage: PageComponent<Extract<Route, { name: "courseInfo" }>>;
  readonly ModulesPage: PageComponent<Extract<Route, { name: "modules" }>>;
  readonly CommonListPage: PageComponent<Extract<Route, { name: "commonList" }>>;
  readonly CommonDetailPage: PageComponent<Extract<Route, { name: "commonDetail" }>>;
  readonly ShixunListPage: PageComponent<Extract<Route, { name: "shixunList" }>>;
  readonly ShixunDetailPage: PageComponent<Extract<Route, { name: "shixunDetail" }>>;
  readonly RepositoryPage: PageComponent<Extract<Route, { name: "repository" }>>;
  readonly FilePage: PageComponent<Extract<Route, { name: "file" }>>;
  readonly ExamsPage: PageComponent<Extract<Route, { name: "exams" }>>;
  readonly ExamDetailPage: PageComponent<Extract<Route, { name: "examDetail" }>>;
  readonly ExamShowPage: PageComponent<Extract<Route, { name: "examShow" }>>;
};
