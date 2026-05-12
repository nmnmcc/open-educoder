import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { LabAssignmentFeature } from "../../../../services/features/assignments/lab.js";
import {
  ChallengeId,
  ChallengeIndex,
  CommitId,
  CourseId,
  EnvironmentId,
  AssignmentIdArgument,
  SecKey,
  TabType,
} from "../../flags.js";
import { renderGeneric } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Build = Command.make(
  "build",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    secKey: SecKey,
    commitId: CommitId,
    contentModified: Flag.integer("content-modified").pipe(Flag.withDefault(0)),
    resubmit: Flag.string("resubmit").pipe(Flag.withDefault("")),
    envId: EnvironmentId,
    tabType: TabType,
    json: Flag.boolean("json"),
  },
  Effect.fn("assignments.labs.build")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.buildRepositoryFile({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
      secKey: input.secKey,
      resubmit: input.resubmit,
      commitId: input.commitId,
      contentModified: input.contentModified,
      envId: optionToUndefined(input.envId),
      tabType: input.tabType,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("构建结果 / Build Result", result.view));
  }),
).pipe(
  Command.withDescription("Trigger a build/run action for an already saved repository snapshot."),
  Command.withExamples([
    {
      command:
        "open-educoder assignments labs build 109348 3487324 --sec-key ypzno7qmxwjt --commit-id 6a4abf53145fe87c261681074a51a4374fbba65a",
      description: "Trigger evaluation by sec key and commit id",
    },
  ]),
  Command.withAlias("B"),
);
