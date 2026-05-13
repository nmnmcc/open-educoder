import { Data, Effect, Exit, Schema } from "effect";

import type { Version } from "./schema/version.js";

export class MigrateError extends Data.TaggedError("MigrateError")<{}> {}

export const migrate = (data: unknown, version: Version): Effect.Effect<{}, MigrateError> =>
  Effect.gen(function* () {
    const codec = Schema.toCodecJson(version.schema);
    const exit = Schema.decodeUnknownExit(codec)(data);

    if (Exit.isSuccess(exit)) {
      return exit.value;
    }

    if (version.from) {
      const migrated = yield* migrate(data, version.from);

      return version.migrate(migrated);
    }

    if (data !== undefined) {
      yield* Effect.logWarning(exit.cause);
    }

    return version.init;
  });
