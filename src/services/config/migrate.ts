import { Data, Effect, Exit, Schema } from "effect";
import type { Version } from "./schema/version.js";

export class MigrateError extends Data.TaggedError("MigrateError")<{}> {}

export const migrate = (data: {}, version: Version): Effect.Effect<{}, MigrateError> =>
  Effect.gen(function* () {
    const codec = Schema.toCodecJson(version.schema);
    const exit = Schema.decodeUnknownExit(codec)(data);

    if (Exit.isSuccess(exit)) {
      return exit.value;
    }

    yield* Effect.logWarning(exit.cause);

    if (version.from) {
      const migrated = yield* migrate(data, version.from);

      return version.migrate(migrated);
    }

    return version.init;
  });
