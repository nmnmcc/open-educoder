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

export const CourseId = Argument.string("course-id");
export const TaskId = Argument.string("task-id");
export const AssignmentIdArgument = Argument.string("assignment-id");
export const RepositoryPath = Argument.string("path");
export const ChallengeIndex = PositiveInteger("challenge-index").pipe(Flag.optional);
export const ChallengeId = PositiveInteger("challenge-id").pipe(Flag.optional);
export const RequiredChallengeIndex = PositiveInteger("challenge-index").pipe(
  Flag.withDescription("(REQUIRED unless --challenge-id is used) Challenge index from `assignments labs challenges`."),
  Flag.optional,
);
export const RequiredChallengeId = PositiveInteger("challenge-id").pipe(
  Flag.withDescription("(REQUIRED unless --challenge-index is used) Challenge ID from `assignments labs challenges`."),
  Flag.optional,
);
export const AssignmentId = NonEmptyStringFlag("assignment-id");
export const Content = Flag.string("content").pipe(Flag.optional);
export const ContentFile = Flag.path("file").pipe(Flag.optional);
export const EnvironmentId = PositiveInteger("env-id").pipe(Flag.optional);
export const TabType = PositiveInteger("tab-type").pipe(Flag.withDefault(1));
export const TerminalTabType = PositiveInteger("tab-type").pipe(Flag.withDefault(4));
export const SecKey = NonEmptyStringFlag("sec-key");
export const CommitId = NonEmptyStringFlag("commit-id");
