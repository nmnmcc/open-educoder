# open-educoder

Open Educoder as a fast local CLI.

- Manage saved login profiles
- List courses and course modules
- Check, edit, and submit homework workflows (including shixun)
- Inspect and submit exams

## Install and launch

```bash
yarn install
yarn cli --help
```

The binary is `open-educoder` (same as `yarn cli` in this repo).  
If you need shell completion, use your shell's normal aliasing for `yarn cli`.

## Core flow

1) Add at least one profile first (required for all account-specific operations).

```bash
open-educoder profile add --username "$EDUCODER_USERNAME" --password "$EDUCODER_PASSWORD"
```

2) Explore courses, then pick a `course-id`.

```bash
open-educoder course list
open-educoder course info COURSE_ID
```

3) Operate the two homework types.

```bash
open-educoder homework common list COURSE_ID
open-educoder homework shixun list COURSE_ID --category CATEGORY_ID
```

4) For exams, locate and submit an attempt.

```bash
open-educoder exam list COURSE_ID
open-educoder exam show COURSE_ID EXAM_ID --with-choice-content
open-educoder exam answer single QUESTION_ID CHOICE_ID
open-educoder exam submit COURSE_ID EXAM_ID
```

Use `open-educoder <command> --help` at any point for the exact arguments.

## Global options

All commands inherit these options:

```bash
--url https://data.educoder.net
--profile default
--config ~/.config/open-educoder
--otel false
```

Use `--url` for custom endpoints, `--profile` to select a saved profile, `--config` for a custom config directory, and `--otel` to enable OpenTelemetry output.

`--json` is supported by many commands and outputs raw API responses suitable for scripting.

## Available commands (user-oriented)

```bash
open-educoder --help
open-educoder profile --help
open-educoder course --help
open-educoder homework --help
open-educoder homework common --help
open-educoder homework shixun --help
open-educoder exam --help
open-educoder tui
```

## Command quick reference

### Profiles

```bash
open-educoder profile list
open-educoder profile add --username USERNAME --password PASSWORD [NAME]
open-educoder profile remove PROFILE_NAME
```

### Courses

```bash
open-educoder course list
open-educoder course info COURSE_ID
open-educoder course modules COURSE_ID
```

### Homework (common)

```bash
open-educoder homework common list COURSE_ID
open-educoder homework common info HOMEWORK_ID
open-educoder homework common works COURSE_ID HOMEWORK_ID
open-educoder homework common draft COURSE_ID HOMEWORK_ID
open-educoder homework common members COURSE_ID HOMEWORK_ID
open-educoder homework common comments COURSE_ID HOMEWORK_ID
open-educoder homework common settings COURSE_ID HOMEWORK_ID
open-educoder homework common redo-logs HOMEWORK_ID
```

### Homework (shixun)

```bash
open-educoder homework shixun list COURSE_ID --category CATEGORY_ID
open-educoder homework shixun task TASK_ID --homework-id HOMEWORK_ID
open-educoder homework shixun repository TASK_ID --homework-id HOMEWORK_ID
open-educoder homework shixun repository TASK_ID case1/code.sh --homework-id HOMEWORK_ID
open-educoder homework shixun content TASK_ID case1/code.sh --homework-id HOMEWORK_ID
open-educoder homework shixun passed TASK_ID case1/code.sh
open-educoder homework shixun edit TASK_ID case1/code.sh --homework-id HOMEWORK_ID
open-educoder homework shixun save TASK_ID case1/code.sh --homework-id HOMEWORK_ID --file ./code.sh
open-educoder homework shixun evaluate TASK_ID case1/code.sh --homework-id HOMEWORK_ID --file ./code.sh --poll
open-educoder homework shixun build TASK_ID --homework-id HOMEWORK_ID --sec-key SEC_KEY --commit-id COMMIT_ID
open-educoder homework shixun status TASK_ID --homework-id HOMEWORK_ID --sec-key SEC_KEY
open-educoder homework shixun reset TASK_ID --homework-id HOMEWORK_ID
open-educoder homework shixun logs TASK_ID --homework-id HOMEWORK_ID --env-id ENV_ID
open-educoder homework shixun commit TASK_ID --homework-id HOMEWORK_ID --env-id ENV_ID
open-educoder homework shixun pull TASK_ID --homework-id HOMEWORK_ID --env-id ENV_ID
open-educoder homework shixun remaining-time TASK_ID --homework-id HOMEWORK_ID
open-educoder homework shixun prune TASK_ID --homework-id HOMEWORK_ID
open-educoder homework shixun ssh TASK_ID --homework-id HOMEWORK_ID --env-id ENV_ID
```

### Exam

```bash
open-educoder exam list COURSE_ID
open-educoder exam info COURSE_ID EXAM_ID
open-educoder exam start COURSE_ID EXAM_ID
open-educoder exam show COURSE_ID EXAM_ID
open-educoder exam answer single QUESTION_ID CHOICE_ID
open-educoder exam answer multiple QUESTION_ID CHOICE_ID1,CHOICE_ID2
open-educoder exam answer text QUESTION_ID "TEXT"
open-educoder exam submit COURSE_ID EXAM_ID
```

## Aliases

One-letter aliases are provided for faster input.

- Uppercase alias means the command can change state in an irreversible way.

```text
profile: list l, add a, remove R, command p
course: list l, info i, modules m, command c
exam: list l, info i, start S, show H, submit U, answer A, command e
homework: command h, common c, shixun x
homework common: list l, info i, works w, draft n, members u, comments q, settings g, redo-logs d
homework shixun: list l, task t, content c, repository f, passed a, edit D, save S, build B, status s, evaluate E, logs o, commit C, pull P, reset R, remaining-time m, prune V, ssh r
```

## Troubleshooting

- `profile list` shows “No profiles found.”: run `profile add` first.
- Commands that print nothing usually mean your current profile lacks permission for that course or homework.
- Use `--json` if you need stable machine-readable output for scripting.
- For shixun `edit`, ensure `EDITOR` or `VISUAL` is set in your shell.

## Scripts

- `yarn cli`: run the CLI once
- `yarn dev`: run CLI in watch mode
- `yarn tui`: open interactive TUI (if available)
- `yarn check`: TypeScript type check
- `yarn build`: production bundle

## Layout

- `src/index.ts`: CLI root definition and command wiring.
- `src/commands/`: command group implementations and user-facing help text.
- `src/services/`: runtime services and Educoder API client layer.
