import { Argument, Flag } from "effect/unstable/cli";

export const AssignmentSortByChoices = ["created_at", "updated_at", "name_pinyin", "position"] as const;
export const SortDirectionChoices = ["desc", "asc"] as const;

export const AssignmentTypeCode = {
  common: 1,
  lab: 4,
} as const;

export const PositiveInteger = (name: string) =>
  Flag.integer(name).pipe(
    Flag.filter(
      (value) => value >= 1,
      (value) => `${name} must be greater than or equal to 1, got ${value}`,
    ),
  );

export const NonEmptyStringFlag = (name: string) =>
  Flag.string(name).pipe(
    Flag.filter(
      (value) => value.length >= 1,
      (value) => `${name} must not be empty, got ${value}`,
    ),
  );

export const CourseId = Argument.string("course-id").pipe(
  Argument.withDescription("Course ID shown by `courses list` or `assignments list`."),
);
export const TaskId = Argument.string("task-id").pipe(
  Argument.withDescription("Lab task ID resolved by `assignments labs task`."),
);
export const AssignmentIdArgument = Argument.string("assignment-id").pipe(
  Argument.withDescription(
    "Assignment ID shown by `assignments list`, `assignments common list`, or `assignments labs list`.",
  ),
);
export const RepositoryPath = Argument.string("path").pipe(
  Argument.withDescription("Repository file path, such as case1/code.sh."),
);
export const ChallengeIndex = PositiveInteger("challenge-index").pipe(
  Flag.withDescription("Challenge index shown by `assignments labs challenges`; omit to use current task context."),
  Flag.optional,
);
export const ChallengeId = PositiveInteger("challenge-id").pipe(
  Flag.withDescription("Challenge ID shown by `assignments labs challenges`; omit to use current task context."),
  Flag.optional,
);
export const RequiredChallengeIndex = PositiveInteger("challenge-index").pipe(
  Flag.withDescription(
    "Required unless --challenge-id is used. Use the challenge index from `assignments labs challenges`.",
  ),
  Flag.optional,
);
export const RequiredChallengeId = PositiveInteger("challenge-id").pipe(
  Flag.withDescription(
    "Required unless --challenge-index is used. Use the challenge ID from `assignments labs challenges`.",
  ),
  Flag.optional,
);
export const AssignmentId = NonEmptyStringFlag("assignment-id").pipe(
  Flag.withDescription("Assignment ID shown by an assignment list command."),
);
export const Content = Flag.string("content").pipe(
  Flag.withDescription("Inline content to upload to the repository file."),
  Flag.optional,
);
export const ContentFile = Flag.path("file").pipe(
  Flag.withDescription("Local file whose contents should be uploaded."),
  Flag.optional,
);
export const EnvironmentId = PositiveInteger("env-id").pipe(
  Flag.withDescription("Runtime environment ID; omit to let the command resolve it when possible."),
  Flag.optional,
);
export const TabType = PositiveInteger("tab-type").pipe(
  Flag.withDescription("Educoder runtime tab type for evaluation, log, and save actions."),
  Flag.withDefault(1),
);
export const TerminalTabType = PositiveInteger("tab-type").pipe(
  Flag.withDescription("Educoder runtime tab type for terminal/SSH actions."),
  Flag.withDefault(4),
);
export const SecKey = NonEmptyStringFlag("sec-key").pipe(
  Flag.withDescription("Evaluation sec-key returned by Educoder evaluation responses."),
);
export const CommitId = NonEmptyStringFlag("commit-id").pipe(
  Flag.withDescription("Repository commit ID returned after saving or committing files."),
);
