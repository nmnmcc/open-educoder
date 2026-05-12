import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import {
  ChallengeId,
  ChallengeIndex,
  Content,
  ContentFile,
  CourseId,
  EnvironmentId,
  HomeworkIdArgument,
  PositiveInteger,
  RepositoryPath,
  TabType,
} from "../../flags.js";
import { renderGeneric } from "../../render.js";
import { asRecord, optionToUndefined, printJson, printStatusResponse, readContent, stringField } from "../../shared.js";

export const Evaluate = Command.make(
  "evaluate",
  {
    courseId: CourseId,
    homeworkId: HomeworkIdArgument,
    path: RepositoryPath,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    content: Content,
    file: ContentFile,
    envId: EnvironmentId,
    tabType: TabType,
    poll: Flag.boolean("poll"),
    pollInterval: PositiveInteger("poll-interval").pipe(Flag.withDefault(2)),
    pollLimit: PositiveInteger("poll-limit").pipe(Flag.withDefault(20)),
    json: Flag.boolean("json"),
  },
  Effect.fn("homework.shixun.evaluate")(function* (input) {
    const content = yield* readContent({
      content: input.content,
      file: input.file,
    });
    const homeworkShixunFeature = yield* HomeworkShixunFeature;
    const result = yield* homeworkShixunFeature.evaluateRepositoryFile({
      courseId: input.courseId,
      path: input.path,
      homeworkId: input.homeworkId,
      challengeIndex: optionToUndefined(input.challengeIndex),
      challengeId: optionToUndefined(input.challengeId),
      content,
      envId: optionToUndefined(input.envId),
      tabType: input.tabType,
      poll: input.poll,
      pollInterval: input.pollInterval,
      pollLimit: input.pollLimit,
      onRunning: input.json
        ? undefined
        : ({ attempt, limit, response }) => {
            const running = asRecord(response);

            return Console.log(`[${attempt}/${limit}] ${stringField(running, "running_code_message") ?? "running"}`);
          },
    });

    if (input.json) {
      return yield* printJson(result.raw);
    }

    if (result.raw.status !== null) {
      return yield* printStatusResponse(result.raw.status, false);
    }

    yield* Console.log(renderGeneric("评测提交 / Evaluation Submission", result.view));
  }),
).pipe(
  Command.withDescription("Submit a file for evaluation and optionally poll until a result is available."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun evaluate 109348 3487324 case1/code.sh --file ./code.sh",
      description: "Save and evaluate one repository file",
    },
    {
      command:
        "open-educoder homework shixun evaluate 109348 3487324 case1/code.sh --file ./code.sh --poll --poll-interval 2 --poll-limit 20",
      description: "Save, evaluate, and poll until completion",
    },
  ]),
  Command.withAlias("E"),
);
