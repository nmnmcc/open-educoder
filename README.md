# open-educoder

EffectTS CLI scaffold.

## Usage

```bash
yarn cli --help
yarn cli profile list
yarn cli profile add default --username "$EDUCODER_LOGIN" --password "$EDUCODER_PASSWORD"
yarn cli course list
yarn cli course list --status all --json
yarn cli exam info MOAPGNLO 198085
yarn cli exam start MOAPGNLO 198085
yarn cli exam show MOAPGNLO 198085
yarn cli exam answer 12263457 --choice-id 35397429
```

## Scripts

- `yarn cli` runs the CLI once.
- `yarn dev` runs the CLI in Node watch mode.
- `yarn check` validates TypeScript.

## Layout

- `src/index.ts` defines the Effect CLI commands and Node runtime layer.
- `src/commands/` contains command groups such as `profile` and `course`.
- The CLI is exposed as the `open-educoder` bin.
