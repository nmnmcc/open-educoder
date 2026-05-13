import { readFile } from "node:fs/promises";

import { Console, Effect, Option } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import {
  DefaultLabSshTemplate,
  LabAssignmentFeature,
  renderLabSshTemplate,
} from "../../../../services/features/assignments/lab.js";
import { readStdinText } from "../../../../utils/stdin.js";
import {
  AssignmentIdArgument,
  ChallengeId,
  ChallengeIndex,
  CourseId,
  EnvironmentId,
  TerminalTabType,
} from "../../flags.js";
import { AssignmentInputError, failInput, optionToUndefined, printJson } from "../../shared.js";

const readTemplate = Effect.fn("assignments.labs.ssh.readTemplate")(function* (input: {
  readonly template: Option.Option<string>;
  readonly templateFile: Option.Option<string>;
  readonly stdin: boolean;
}) {
  const selectedSources =
    Number(Option.isSome(input.template)) + Number(Option.isSome(input.templateFile)) + Number(input.stdin);

  if (selectedSources >= 2) {
    return yield* failInput("Use only one of --template, --template-file, or --stdin.");
  }

  if (Option.isSome(input.template)) {
    return input.template.value;
  }

  if (Option.isSome(input.templateFile)) {
    const file = input.templateFile.value;

    return yield* Effect.tryPromise({
      try: () => readFile(file, "utf8"),
      catch: (error) =>
        new AssignmentInputError({
          message: `Failed to read ${file}: ${error instanceof Error ? error.message : String(error)}`,
        }),
    });
  }

  if (input.stdin) {
    return yield* readStdinText((message) => new AssignmentInputError({ message: String(message) }));
  }

  return DefaultLabSshTemplate;
});

export const Ssh = Command.make(
  "ssh",
  {
    courseId: CourseId,
    homeworkId: AssignmentIdArgument,
    challengeIndex: ChallengeIndex,
    challengeId: ChallengeId,
    envId: EnvironmentId,
    tabType: TerminalTabType,
    template: Flag.string("template").pipe(
      Flag.withDescription("Mustache template rendered with SSH connection fields."),
      Flag.optional,
    ),
    templateFile: Flag.path("template-file", { pathType: "file", mustExist: true }).pipe(
      Flag.withDescription("Read the Mustache template from a local file."),
      Flag.optional,
    ),
    stdin: Flag.boolean("stdin").pipe(Flag.withDescription("Read the Mustache template from standard input.")),
    json: Flag.boolean("json").pipe(
      Flag.withDescription("Print the raw SSH start response as JSON instead of rendering a template."),
    ),
  },
  Effect.fn("assignments.labs.ssh")(function* (input) {
    const labAssignmentFeature = yield* LabAssignmentFeature;
    const result = yield* labAssignmentFeature.startSsh({
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

    const template = yield* readTemplate({
      template: input.template,
      templateFile: input.templateFile,
      stdin: input.stdin,
    });

    yield* Console.log(yield* renderLabSshTemplate(template, result.view.ssh));
  }),
).pipe(
  Command.withDescription("Resolve SSH connection details for a lab runtime and render a Mustache template."),
  Command.withExamples([
    {
      command: "open-educoder assignments labs ssh 109348 3487324 --env-id 1128633",
      description: "Render the default SSH template for one environment",
    },
    {
      command:
        "open-educoder assignments labs ssh 109348 3487324 --template 'sshpass -p {{password}} ssh -p {{port}} {{target}}'",
      description: "Render a custom Mustache template",
    },
    {
      command: "open-educoder assignments labs ssh 109348 3487324 --tab-type 4 --json",
      description: "Print raw SSH start details as JSON",
    },
  ]),
  Command.withAlias("r"),
);
