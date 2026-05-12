# open-educoder

Open Educoder as a fast local CLI.

- Manage saved login profiles
- List courses and course modules
- Check, edit, and submit assignment workflows (including lab)
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
open-educoder profiles add --username "$EDUCODER_USERNAME" --password "$EDUCODER_PASSWORD"
```

2) Explore courses, then pick a `course-id`.

```bash
open-educoder courses list
open-educoder courses info COURSE_ID
```

3) Operate the two assignment types.

```bash
open-educoder assignments common list COURSE_ID
open-educoder assignments labs list COURSE_ID --category CATEGORY_ID
```

4) For exams, locate and submit an attempt.

```bash
open-educoder exams list COURSE_ID
open-educoder exams show COURSE_ID EXAM_ID --with-choice-content
open-educoder exams answer single QUESTION_ID CHOICE_ID
open-educoder exams submit COURSE_ID EXAM_ID
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
open-educoder profiles --help
open-educoder courses --help
open-educoder assignments --help
open-educoder assignments common --help
open-educoder assignments labs --help
open-educoder exams --help
open-educoder tui
```

## Command quick reference

### Profiles

```bash
open-educoder profiles list
open-educoder profiles add --username USERNAME --password PASSWORD [NAME]
open-educoder profiles remove PROFILE_NAME
```

### Courses

```bash
open-educoder courses list
open-educoder courses info COURSE_ID
open-educoder courses modules COURSE_ID
```

### Assignments (common)

```bash
open-educoder assignments common list COURSE_ID
open-educoder assignments common info ASSIGNMENT_ID
open-educoder assignments common work COURSE_ID ASSIGNMENT_ID
open-educoder assignments common draft COURSE_ID ASSIGNMENT_ID
open-educoder assignments common members COURSE_ID ASSIGNMENT_ID
open-educoder assignments common comments COURSE_ID ASSIGNMENT_ID
open-educoder assignments common settings COURSE_ID ASSIGNMENT_ID
open-educoder assignments common redo-logs ASSIGNMENT_ID
```

### Assignments (labs)

```bash
open-educoder assignments labs list COURSE_ID --category CATEGORY_ID
open-educoder assignments labs challenges COURSE_ID ASSIGNMENT_ID
open-educoder assignments labs task COURSE_ID ASSIGNMENT_ID
open-educoder assignments labs learning COURSE_ID ASSIGNMENT_ID --challenge-index INDEX
open-educoder assignments labs repository COURSE_ID ASSIGNMENT_ID --path case1
open-educoder assignments labs content COURSE_ID ASSIGNMENT_ID case1/code.sh
open-educoder assignments labs passed COURSE_ID ASSIGNMENT_ID case1/code.sh
open-educoder assignments labs edit COURSE_ID ASSIGNMENT_ID case1/code.sh
open-educoder assignments labs save COURSE_ID ASSIGNMENT_ID case1/code.sh --file ./code.sh
open-educoder assignments labs evaluate COURSE_ID ASSIGNMENT_ID case1/code.sh --file ./code.sh --poll
open-educoder assignments labs build COURSE_ID ASSIGNMENT_ID --sec-key SEC_KEY --commit-id COMMIT_ID
open-educoder assignments labs status COURSE_ID ASSIGNMENT_ID --sec-key SEC_KEY
open-educoder assignments labs reset COURSE_ID ASSIGNMENT_ID
open-educoder assignments labs logs COURSE_ID ASSIGNMENT_ID --env-id ENV_ID
open-educoder assignments labs commit COURSE_ID ASSIGNMENT_ID --env-id ENV_ID
open-educoder assignments labs pull COURSE_ID ASSIGNMENT_ID --env-id ENV_ID
open-educoder assignments labs remaining-time COURSE_ID ASSIGNMENT_ID
open-educoder assignments labs prune COURSE_ID ASSIGNMENT_ID
open-educoder assignments labs ssh COURSE_ID ASSIGNMENT_ID --env-id ENV_ID
```

### Exam

```bash
open-educoder exams list COURSE_ID
open-educoder exams info COURSE_ID EXAM_ID
open-educoder exams start COURSE_ID EXAM_ID
open-educoder exams show COURSE_ID EXAM_ID
open-educoder exams answer single QUESTION_ID CHOICE_ID
open-educoder exams answer multiple QUESTION_ID CHOICE_ID1,CHOICE_ID2
open-educoder exams answer text QUESTION_ID "TEXT"
open-educoder exams submit COURSE_ID EXAM_ID
```

## Aliases

One-letter aliases are provided for faster input.

- Uppercase alias means the command can change state in an irreversible way.

```text
profiles: list l, add a, remove R, command p
courses: list l, info i, modules m, command c
exams: list l, info i, start S, show H, submit U, answer A, command e
assignments: list l, common c, labs b, command a
assignments common: list l, info i, work w, draft n, members u, comments q, settings g, redo-logs d
assignments labs: list l, challenges k, task t, learning g, content c, repository f, passed a, edit D, save S, build B, status s, evaluate E, logs o, commit C, pull P, reset R, remaining-time m, prune V, ssh r
```

## Troubleshooting

- `profiles list` shows “No profiles found.”: run `profiles add` first.
- Commands that print nothing usually mean your current profile lacks permission for that course or assignment.
- Use `--json` if you need stable machine-readable output for scripting.
- For lab `edit`, ensure `EDITOR` or `VISUAL` is set in your shell.

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
