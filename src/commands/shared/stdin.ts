import { Buffer } from "node:buffer";
import { stdin } from "node:process";

import { Array, Effect, Stream } from "effect";

export const readStdinText = <E>(onError: (error: unknown) => E) =>
  Stream.unwrap(
    Effect.gen(function* () {
      stdin.setEncoding("utf8");

      return Stream.fromAsyncIterable(stdin, onError).pipe(Stream.map((c) => Buffer.from(c).toString("utf-8")));
    }),
  ).pipe(Stream.runCollect, Effect.map(Array.join("")));
