import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import { ChallengeId, ChallengeIndex, CourseId, EnvironmentId, HomeworkIdArgument, TabType } from "../../flags.js";
import { renderGeneric } from "../../render.js";
import { optionToUndefined, printJson } from "../../shared.js";

export const Logs = Command.make(
  "logs",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    envId: EnvironmentId,
    tabType: TabType,
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.logs")(function* (input) {
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.getLogs({
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
      envId: optionToUndefined(input.envId),
      tabType: input.tabType,
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    yield* Console.log(renderGeneric("日志 / Logs", result.view));
  }),
).pipe(
  Command.withDescription("Fetch terminal or build logs for a shixun environment."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun logs 109348 3487324 --env-id 1128633",
      description: "Read latest logs for an environment",
    },
  ]),
  Command.withAlias("o"),
);
