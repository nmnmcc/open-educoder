# open-educoder

EffectTS CLI scaffold.

## Usage

```bash
yarn cli --help
yarn cli profile add default --username "$EDUCODER_LOGIN" --password "$EDUCODER_PASSWORD"
yarn cli course list
yarn cli course list --status all --json
```

## Scripts

- `yarn cli` runs the CLI once.
- `yarn dev` runs the CLI in Node watch mode.
- `yarn check` validates TypeScript.

## Layout

- `src/index.ts` defines the Effect CLI commands and Node runtime layer.
- `src/commands/` contains command groups such as `profile` and `course`.
- The CLI is exposed as the `open-educoder` bin.
