import { Context, Effect, Equal, FileSystem, JsonSchema, Layer, PlatformError, Schema } from "effect";
import path from "node:path";
import { migrate, MigrateError } from "./migrate.js";
import { latest } from "./schema/index.js";

const CONFIG = "config.json";
const SCHEMA = "./schema.json" as const;

export const AppConfigSchema = latest.schema;
const AppConfigFileSchema = Schema.Struct({
  $schema: Schema.Literal(SCHEMA),
  ...AppConfigSchema.fields,
});

export type AppConfigState = typeof AppConfigSchema.Type;

export type AppConfigError = PlatformError.PlatformError | Schema.SchemaError | MigrateError;

export type AppConfigShape = {
  readonly read: Effect.Effect<AppConfigState, AppConfigError>;
  readonly write: (next: AppConfigState) => Effect.Effect<void, AppConfigError>;
};

const readJson = (fs: FileSystem.FileSystem, location: string): Effect.Effect<{}, PlatformError.PlatformError> =>
  fs.readFileString(location).pipe(
    Effect.map((content) => {
      if (content.trim() === "") return undefined;
      return JSON.parse(content);
    }),
  );

const formatJson = (value: unknown) => `${JSON.stringify(value, null, "\t")}\n`;

const writeJson = (fs: FileSystem.FileSystem, location: string, value: unknown) =>
  fs.writeFileString(location, formatJson(value));

const makeJsonSchema = () => {
  const { schema, definitions: $defs } = Schema.toJsonSchemaDocument(AppConfigFileSchema);

  return {
    $schema: JsonSchema.META_SCHEMA_URI_DRAFT_2020_12,
    ...schema,
    $defs,
  };
};

export class AppConfig extends Context.Service<AppConfig, AppConfigShape>()("open-educoder/services/config/AppConfig", {
  make: (directory: string) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const location = path.join(directory, CONFIG);
      const schemaLocation = path.join(directory, SCHEMA);
      const codec = Schema.toCodecJson(latest.schema);
      const fileCodec = Schema.toCodecJson(AppConfigFileSchema);

      if (!(yield* fs.exists(directory))) {
        yield* fs.makeDirectory(directory, { recursive: true });
      }

      yield* writeJson(fs, schemaLocation, makeJsonSchema());

      if (!(yield* fs.exists(location))) {
        yield* fs.writeFileString(location, "");
      }

      const raw = yield* readJson(fs, location);
      const migrated = yield* migrate(raw, latest);
      const encoded = yield* Schema.encodeUnknownEffect(fileCodec)({ ...migrated, $schema: SCHEMA });

      if (!Equal.equals(raw, encoded)) {
        yield* writeJson(fs, location, encoded);
      }

      return {
        read: readJson(fs, location).pipe(Effect.flatMap(Schema.decodeUnknownEffect(codec))),
        write: (next) =>
          Schema.encodeUnknownEffect(fileCodec)({ ...next, $schema: SCHEMA }).pipe(
            Effect.flatMap((value) => writeJson(fs, location, value)),
          ),
      };
    }),
}) {
  public static readonly layer = (directory: string) => Layer.effect(AppConfig, AppConfig.make(directory));
}
