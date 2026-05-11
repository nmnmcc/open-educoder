import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { HomeworkShixunFeature } from "../../../../services/features/homework/shixun.js";
import {
  Content,
  ContentFile,
  EnvironmentId,
  HomeworkId,
  PositiveInteger,
  RepositoryPath,
  TabType,
  TaskId,
} from "../../flags.js";
import {
  inspectOptions,
  optionToUndefined,
  printJson,
  printStatusResponse,
  readContent,
  stringField,
  asRecord,
} from "../../shared.js";

export const Evaluate = Command.make(
  "evaluate",
  {
    taskId: TaskId,
    path: RepositoryPath,
    homeworkId: HomeworkId,
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
      taskId: input.taskId,
      path: input.path,
      homeworkId: input.homeworkId,
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

    yield* Console.dir(result.view, inspectOptions);
  }),
).pipe(
  Command.withDescription("Save a shixun homework file, trigger evaluation, and optionally poll until completion."),
  Command.withExamples([
    {
      command:
        "open-educoder homework shixun evaluate sflmr2fxi4wn case1/code.sh --homework-id 3487324 --file ./code.sh",
      description: "Save and evaluate a task path",
    },
    {
      command:
        "open-educoder homework shixun evaluate sflmr2fxi4wn case1/code.sh --homework-id 3487324 --file ./code.sh --poll --poll-interval 2 --poll-limit 20",
      description: "Save, evaluate, and poll until a result is available",
    },
  ]),
  Command.withAlias("E"),
);
