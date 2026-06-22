# open-educoder

Run authenticated Educoder workflows from a local CLI.

This tool is for accounts and courses you can already access normally. It keeps the workflow local and command-line friendly:

- Add, list, and remove saved Educoder accounts.
- Find course IDs and course category IDs.
- List common and lab assignments with copyable next commands.
- Inspect common assignment details, work status, drafts, members, comments, settings, and redo logs.
- Work with lab challenges, learning content, repository files, evaluation/status checks, runtime logs, and SSH.
- List exams, start attempts, show questions, save answers, and submit.
- Browse online judge problems, filter by source, start attempts, read statements, debug, and submit code.

## Install And Launch

```bash
yarn install
yarn cli --help
```

The package binary is `open-educoder`. Inside this repository, `yarn cli` runs the same CLI through source files.

```bash
yarn cli courses list
open-educoder courses list
```

Use `open-educoder <command> --help` at any point for exact arguments, aliases, flags, and examples.

## Core Concepts

Most commands take IDs that are returned by earlier commands:

| Value                              | Where to get it                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `course-id`                        | `open-educoder courses list`                                                                                  |
| assignment category ID             | `open-educoder courses modules COURSE_ID`                                                                     |
| common assignment ID               | `open-educoder assignments list COURSE_ID --type common` or `open-educoder assignments common list COURSE_ID` |
| lab assignment ID                  | `open-educoder assignments list COURSE_ID --type lab` or `open-educoder assignments labs list COURSE_ID`      |
| `challenge-index` / `challenge-id` | `open-educoder assignments labs challenges COURSE_ID ASSIGNMENT_ID`                                           |
| repository `path`                  | `open-educoder assignments labs repository COURSE_ID ASSIGNMENT_ID`                                           |
| `env-id`                           | lab task, save, evaluation, log, or runtime responses when Educoder exposes one                               |
| `sec-key`                          | lab evaluation responses                                                                                      |
| `commit-id`                        | lab save, commit, or snapshot evaluation responses                                                            |
| `exam-id`                          | `open-educoder exams list COURSE_ID`                                                                          |
| `question-id`, `choice-id`, blanks | `open-educoder exams show COURSE_ID EXAM_ID --with-choice-content`                                            |
| problem `identifier`               | `open-educoder problems list`                                                                                 |
| problem `source` ID                | `open-educoder problems sources`                                                                              |
| problem `workspace`                | `open-educoder problems start IDENTIFIER`                                                                     |

Many commands support `--json` for raw API-shaped output that is easier to inspect or pipe into scripts.

## First Run

Add an account first. Authenticated commands use the selected account.

```bash
open-educoder accounts add --username "$EDUCODER_USERNAME" --password "$EDUCODER_PASSWORD"
open-educoder accounts list
```

Find your courses and optional assignment categories:

```bash
open-educoder courses list
open-educoder courses info COURSE_ID
open-educoder courses modules COURSE_ID
```

List all assignments in a course. The output includes IDs and next commands.

```bash
open-educoder assignments list COURSE_ID --type all
```

## Global Options

All commands inherit these options:

```bash
--url URL
--account default
--config ~/.config/open-educoder
--otel false
```

| Option      | Purpose                                                          |
| ----------- | ---------------------------------------------------------------- |
| `--url`     | Educoder base URL to call. Defaults to the selected account URL. |
| `--account` | Saved Educoder account to use.                                   |
| `--config`  | Local config directory.                                          |
| `--otel`    | Print OpenTelemetry spans to the console.                        |

## Command Reference

### Accounts

| Command                                                                     | Purpose                                                  |
| --------------------------------------------------------------------------- | -------------------------------------------------------- |
| `open-educoder accounts list`                                               | List saved accounts and mark the active one.             |
| `open-educoder accounts add --username USERNAME --password PASSWORD [NAME]` | Log in and save the returned session as a local account. |
| `open-educoder accounts remove ACCOUNT_NAME`                                | Remove a saved account and its stored session cookies.   |

### Courses

| Command                                          | Purpose                                                          |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| `open-educoder courses list`                     | List courses visible to the selected account.                    |
| `open-educoder courses list --status all --json` | List all courses as raw JSON.                                    |
| `open-educoder courses info COURSE_ID`           | Show title, teachers, counts, and visibility for one course.     |
| `open-educoder courses modules COURSE_ID`        | Show course modules and category IDs used to filter assignments. |

### Assignment Overview

| Command                                                           | Purpose                                         |
| ----------------------------------------------------------------- | ----------------------------------------------- |
| `open-educoder assignments list COURSE_ID --type all`             | List common and lab assignments together.       |
| `open-educoder assignments list COURSE_ID --type common`          | List only common assignments.                   |
| `open-educoder assignments list COURSE_ID --type lab`             | List only lab assignments.                      |
| `open-educoder assignments list COURSE_ID --category CATEGORY_ID` | Filter by a category ID from `courses modules`. |
| `open-educoder assignments list COURSE_ID --search KEYWORD`       | Search assignment names.                        |

### Common Assignments

| Command                                                                             | Purpose                                                   |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `open-educoder assignments common list COURSE_ID`                                   | List common assignments and show IDs for detail commands. |
| `open-educoder assignments common info ASSIGNMENT_ID`                               | Show instructions, attachments, and metadata.             |
| `open-educoder assignments common work COURSE_ID ASSIGNMENT_ID`                     | Show your submission/work status and score.               |
| `open-educoder assignments common draft COURSE_ID ASSIGNMENT_ID`                    | Show your current draft context.                          |
| `open-educoder assignments common members COURSE_ID ASSIGNMENT_ID --search KEYWORD` | Search course members and show their submission status.   |
| `open-educoder assignments common comments COURSE_ID ASSIGNMENT_ID`                 | Show assignment discussion comments.                      |
| `open-educoder assignments common settings COURSE_ID ASSIGNMENT_ID`                 | Show deadline, scoring, visibility, and submission rules. |
| `open-educoder assignments common redo-logs ASSIGNMENT_ID`                          | Show redo attempts and redo history.                      |

Useful list flags: `--category`, `--status`, `--page`, `--limit`, `--order`, `--search`, `--sort-by`, `--sort-direction`, `--json`.

### Lab Discovery And Context

| Command                                                                                              | Purpose                                           |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `open-educoder assignments labs list COURSE_ID`                                                      | List lab assignments and show assignment IDs.     |
| `open-educoder assignments labs list COURSE_ID --category CATEGORY_ID`                               | Filter labs by category.                          |
| `open-educoder assignments labs challenges COURSE_ID ASSIGNMENT_ID`                                  | List challenge indexes and challenge IDs.         |
| `open-educoder assignments labs task COURSE_ID ASSIGNMENT_ID`                                        | Resolve the active lab task context.              |
| `open-educoder assignments labs task COURSE_ID ASSIGNMENT_ID --challenge-index INDEX`                | Resolve one challenge by visible index.           |
| `open-educoder assignments labs learning COURSE_ID ASSIGNMENT_ID --challenge-index INDEX`            | Show challenge learning/task description content. |
| `open-educoder assignments labs learning COURSE_ID ASSIGNMENT_ID --challenge-index INDEX --text`     | Print plain text.                                 |
| `open-educoder assignments labs learning COURSE_ID ASSIGNMENT_ID --challenge-index INDEX --markdown` | Print original Markdown.                          |

Most lab commands accept either `--challenge-index INDEX` or `--challenge-id ID`. Commands that save or evaluate repository files require one of them.

### Lab Repository

| Command                                                                                                                     | Purpose                                                                   |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `open-educoder assignments labs repository COURSE_ID ASSIGNMENT_ID`                                                         | Browse repository root entries.                                           |
| `open-educoder assignments labs repository COURSE_ID ASSIGNMENT_ID --path case1`                                            | Browse a repository directory.                                            |
| `open-educoder assignments labs content COURSE_ID ASSIGNMENT_ID case1/code.sh`                                              | Read and decode one repository file.                                      |
| `open-educoder assignments labs content COURSE_ID ASSIGNMENT_ID case1/code.sh --raw`                                        | Print raw base64 content.                                                 |
| `open-educoder assignments labs passed COURSE_ID ASSIGNMENT_ID case1/code.sh`                                               | Show the last accepted code version for one file.                         |
| `open-educoder assignments labs edit COURSE_ID ASSIGNMENT_ID case1/code.sh`                                                 | Open a repository file in `$VISUAL` or `$EDITOR`, then save changes back. |
| `open-educoder assignments labs save COURSE_ID ASSIGNMENT_ID case1/code.sh --file ./code.sh --challenge-index INDEX`        | Upload local file content to a repository path.                           |
| `open-educoder assignments labs save COURSE_ID ASSIGNMENT_ID case1/code.sh --content "touch file1" --challenge-index INDEX` | Upload inline content.                                                    |
| `open-educoder assignments labs reset COURSE_ID ASSIGNMENT_ID`                                                              | Reset the lab task repository to its initial state.                       |
| `open-educoder assignments labs prune COURSE_ID ASSIGNMENT_ID`                                                              | Ask Educoder to clean up expired repository snapshots.                    |

For `edit`, set an editor that waits until the file is closed:

```bash
VISUAL='code --wait' open-educoder assignments labs edit COURSE_ID ASSIGNMENT_ID case1/code.sh
```

### Lab Evaluation

| Command                                                                                                        | Purpose                                         |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `open-educoder assignments labs evaluate COURSE_ID ASSIGNMENT_ID case1/code.sh --challenge-index INDEX`        | Evaluate current remote content.                |
| `open-educoder assignments labs evaluate COURSE_ID ASSIGNMENT_ID --sec-key SEC_KEY --commit-id COMMIT_ID`      | Evaluate a saved repository snapshot.           |
| `open-educoder assignments labs evaluate COURSE_ID ASSIGNMENT_ID case1/code.sh --poll --challenge-index INDEX` | Evaluate and poll until a result or poll limit. |
| `open-educoder assignments labs status COURSE_ID ASSIGNMENT_ID --sec-key SEC_KEY`                              | Check current evaluation status.                |

`evaluate` only runs code already saved in Educoder. Use `save` or `edit` before `evaluate` when local code changed.

### Lab Runtime Environment

| Command                                                                         | Purpose                                                       |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `open-educoder assignments labs logs COURSE_ID ASSIGNMENT_ID --env-id ENV_ID`   | Fetch terminal or evaluation logs from a runtime environment. |
| `open-educoder assignments labs commit COURSE_ID ASSIGNMENT_ID --env-id ENV_ID` | Create a repository commit from current runtime files.        |
| `open-educoder assignments labs pull COURSE_ID ASSIGNMENT_ID --env-id ENV_ID`   | Pull repository files from a runtime environment.             |
| `open-educoder assignments labs remaining-time COURSE_ID ASSIGNMENT_ID`         | Show remaining runtime/container time.                        |
| `open-educoder assignments labs ssh COURSE_ID ASSIGNMENT_ID --env-id ENV_ID`    | Resolve SSH connection details and connect with local `ssh`.  |
| `open-educoder assignments labs ssh COURSE_ID ASSIGNMENT_ID --json`             | Print SSH arguments instead of running `ssh`.                 |

### Exams

| Command                                                                 | Purpose                                                            |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `open-educoder exams list COURSE_ID`                                    | List exams in a course and show exam IDs.                          |
| `open-educoder exams info COURSE_ID EXAM_ID`                            | Show current exam session state.                                   |
| `open-educoder exams start COURSE_ID EXAM_ID`                           | Start or resume an exam attempt.                                   |
| `open-educoder exams show COURSE_ID EXAM_ID`                            | Show question IDs, types, scores, choices, and current selections. |
| `open-educoder exams show COURSE_ID EXAM_ID --with-choice-content`      | Include full choice text.                                          |
| `open-educoder exams answer single QUESTION_ID CHOICE_ID`               | Save one single-choice answer.                                     |
| `open-educoder exams answer multiple QUESTION_ID CHOICE_ID1,CHOICE_ID2` | Save one multiple-choice answer.                                   |
| `open-educoder exams answer blanks QUESTION_ID ANSWER1 ANSWER2`         | Save ordered blank answers.                                        |
| `open-educoder exams answer text QUESTION_ID "TEXT"`                    | Save one free-text answer.                                         |
| `open-educoder exams submit COURSE_ID EXAM_ID`                          | Submit the current exam attempt with saved answers.                |

### Problems

Online judge problems live under `problems`. A problem `identifier` (from `problems list`) identifies the problem; a `workspace` (returned by `problems start`) identifies your attempt and is required by the code commands.

| Command                                                                         | Purpose                                                                 |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `open-educoder problems list`                                                   | List problems with paging, search, and visibility filter.               |
| `open-educoder problems list --source 2906 --source 2945`                       | Filter by one or more source IDs (repeat `--source` for multiple).      |
| `open-educoder problems list --filter all --json`                               | List all problems as raw JSON.                                          |
| `open-educoder problems sources`                                                | List problem sources (题库) with their IDs and counts.                  |
| `open-educoder problems disciplines`                                            | List discipline tags with their IDs and counts.                         |
| `open-educoder problems start IDENTIFIER`                                       | Start or resume an attempt and print its workspace identifier.          |
| `open-educoder problems info IDENTIFIER`                                        | Show statement, sample, limits, and your last saved code (auto-starts). |
| `open-educoder problems info WORKSPACE --workspace`                             | Show detail for an existing workspace without starting.                 |
| `open-educoder problems code WORKSPACE`                                         | Show starter code templates for each language.                          |
| `open-educoder problems debug WORKSPACE "INPUT" --content "CODE"`               | Save code, run a one-off debug against custom input, and poll result.   |
| `cat sol.cpp \| open-educoder problems debug WORKSPACE "INPUT" --stdin`         | Debug code read from standard input.                                    |
| `open-educoder problems submit WORKSPACE --content "CODE" --language C++`       | Save code, submit for evaluation against all tests, and poll result.    |
| `cat sol.cpp \| open-educoder problems submit WORKSPACE --stdin --language C++` | Submit code read from standard input.                                   |
| `open-educoder problems records WORKSPACE`                                      | List your submission records for a workspace.                           |

Useful list flags: `--page`, `--per-page`, `--search`, `--filter` (`public`/`mine`/`all`), `--source` (repeatable), `--json`.

Code commands take code from `--content` or `--stdin`, and `--language` is one of `C`, `C++`, `Java`, `Python` (default `C++`). `debug` and `submit` save the code first, then poll the judge until a result is ready.

```bash
# Typical flow: find a problem, read it, start an attempt, then submit a solution.
open-educoder problems list --search 阶乘
open-educoder problems info zevwolft
open-educoder problems start zevwolft   # prints the workspace identifier
cat sol.cpp | open-educoder problems submit WORKSPACE --stdin --language C++
open-educoder problems records WORKSPACE
```

## Aliases

One-letter aliases are provided for faster input. Commands with irreversible or remote state-changing side effects use uppercase aliases where applicable; a few uppercase aliases avoid collisions.

```text
accounts: command u, list l, add a, remove R
courses: command c, list l, info i, modules m
assignments: command a, list l, common c, labs b
assignments common: list l, info i, work w, draft n, members u, comments q, settings g, redo-logs d
assignments labs: list l, challenges k, task t, learning g, repository f, content c, passed a, edit D, save S, reset R, prune V, evaluate E, status s, logs o, commit C, pull P, remaining-time m, ssh r
exams: command e, list l, info i, start S, show H, submit U, answer A, single S, multiple M, blanks B, text T
problems: command p, list l, disciplines d, sources o, start S, info i, code c, debug D, submit U, records r
```

Examples:

```bash
open-educoder c l
open-educoder a l COURSE_ID --type lab
open-educoder a b content COURSE_ID ASSIGNMENT_ID case1/code.sh
open-educoder e H COURSE_ID EXAM_ID --with-choice-content
open-educoder p l --source 2906 --source 2945
```

## Troubleshooting

- `accounts list` shows `No accounts found.`: run `accounts add` first.
- A course, assignment, or exam command returning no rows usually means the selected account cannot see that item.
- Use `--account NAME` when you have multiple saved Educoder sessions.
- Use `--json` to inspect raw fields when a compact view hides something you need.
- For lab `edit`, set `VISUAL` or `EDITOR`; for GUI editors, use a command that waits, such as `code --wait`.
- For lab `save` and `evaluate`, pass either `--challenge-index` or `--challenge-id`.
- For lab `ssh`, make sure local `ssh` is installed; use `--json` to inspect the generated connection arguments without connecting.
- For `problems`, code commands (`code`, `debug`, `submit`, `records`) need a `workspace` from `problems start`, not a problem `identifier`. `problems info IDENTIFIER` auto-starts; pass `--workspace` to read an existing workspace without starting.
- For `problems list --source`, pass numeric source IDs from `problems sources`, and repeat `--source` to select multiple.

## Development Scripts

```bash
yarn cli       # run the CLI once
yarn dev       # run the CLI in watch mode
yarn check     # TypeScript type check
yarn build     # production bundle
```

## Layout

- `src/index.ts`: CLI root definition, shared flags, and service wiring.
- `src/commands/`: command definitions, aliases, examples, and user-facing help text.
- `src/services/`: local config/context services, Educoder API client, and feature services.
