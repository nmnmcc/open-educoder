import { Command } from "effect/unstable/cli";
import { ShixunSubcommands } from "./subcommands.js";

export const Shixun = Command.make("shixun").pipe(
  Command.withDescription("Inspect and operate Educoder shixun homework task files, repositories, and evaluations."),
  Command.withExamples([
    {
      command: "open-educoder homework shixun list MOAPGNLO --category 1213302",
      description: "List shixun homework in a course category",
    },
    {
      command: "open-educoder homework shixun content sflmr2fxi4wn case1/code.sh --homework-id 3487324",
      description: "Read a task repository file",
    },
    {
      command: "open-educoder homework shixun evaluate sflmr2fxi4wn case1/code.sh --homework-id 3487324 --file ./code.sh --poll",
      description: "Save a file and poll the evaluation status",
    },
    {
      command: "open-educoder homework shixun repository sflmr2fxi4wn --homework-id 3487324 --path case1",
      description: "List repository files",
    },
  ]),
  Command.withAlias("x"),
  Command.withSubcommands(ShixunSubcommands),
);
