# open-educoder

EffectTS CLI scaffold.

## Usage

```bash
yarn cli --help
yarn cli profile list
yarn cli profile add default --username "$EDUCODER_LOGIN" --password "$EDUCODER_PASSWORD"
yarn cli course list
yarn cli course list --status all --json
yarn cli homework list MOAPGNLO --type shixun --category 1213302
yarn cli homework list MOAPGNLO --type shixun --category 1213302 --sort-by name_pinyin --sort-direction desc
yarn cli homework list MOAPGNLO --type shixun --category 1213302 --search 123 --status 7
yarn cli homework task sflmr2fxi4wn --homework-id 3487324
yarn cli homework content sflmr2fxi4wn case1/code.sh --homework-id 3487324
yarn cli homework edit sflmr2fxi4wn case1/code.sh --homework-id 3487324
yarn cli homework save sflmr2fxi4wn case1/code.sh --homework-id 3487324 --file ./code.sh
yarn cli homework evaluate sflmr2fxi4wn case1/code.sh --homework-id 3487324 --file ./code.sh --poll
yarn cli homework status sflmr2fxi4wn --homework-id 3487324 --sec-key "$SEC_KEY"
yarn cli homework ssh sflmr2fxi4wn --homework-id 3487324
yarn cli exam list MOAPGNLO
yarn cli exam info MOAPGNLO 198085
yarn cli exam start MOAPGNLO 198085
yarn cli exam show MOAPGNLO 198085
yarn cli exam answer single 12263457 35397429
yarn cli e A S 12263457 35397429
yarn cli exam answer multiple 12263483 35397470,35397469
yarn cli exam answer text 12263490 "12"
yarn cli exam submit MOAPGNLO 198085
```

## Command Aliases

Uppercase aliases indicate operations that may cause irreversible side effects.

- `profile` -> `p`; `list` -> `l`; `add` -> `a`; `remove` -> `R`
- `course` -> `c`; `list` -> `l`; `info` -> `i`; `modules` -> `m`
- `homework` -> `h`; `list` -> `l`; `task` -> `t`; `content` -> `c`; `edit` -> `D`; `save` -> `S`; `build` -> `B`; `status` -> `s`; `evaluate` -> `E`; `log-output` -> `o`; `commit-files` -> `C`; `pull-files` -> `P`; `ssh` -> `r`
- `exam` -> `e`; `list` -> `l`; `info` -> `i`; `start` -> `S`; `show` -> `H`; `submit` -> `U`; `answer` -> `A`
- `exam answer`: `single` -> `S`; `multiple` -> `M`; `text` -> `T`

## Scripts

- `yarn cli` runs the CLI once.
- `yarn dev` runs the CLI in Node watch mode.
- `yarn check` validates TypeScript.

## Layout

- `src/index.ts` defines the Effect CLI commands and Node runtime layer.
- `src/commands/` contains command groups; folder-based commands such as `homework/` can split multi-level subcommands across files.
- The CLI is exposed as the `open-educoder` bin.
