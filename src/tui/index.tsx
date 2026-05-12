import { Effect } from "effect";
import { render } from "ink";
import App from "./pages/App.js";

export const run = Effect.fn("tui.run")(function* () {
  yield* Effect.acquireUseRelease(
    Effect.sync(() =>
      render(<App />, {
        alternateScreen: true,
        exitOnCtrlC: true,
      }),
    ),
    (instance) => Effect.promise(() => instance.waitUntilExit()).pipe(Effect.asVoid),
    (instance) => Effect.sync(() => instance.unmount()),
  );
});
