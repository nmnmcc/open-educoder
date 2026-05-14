import { CliRenderEvents, type CliRenderer, createCliRenderer } from "@opentui/core";
import { type Root, createRoot } from "@opentui/react";
import { Effect } from "effect";

import { TuiApp } from "./app/App.js";
import { setTuiTerminalController } from "./runtime/process.js";

type TuiInstance = {
  readonly renderer: CliRenderer;
  readonly root: Root;
  readonly waitUntilExit: Promise<void>;
  readonly unregisterTerminalController: () => void;
};

export const run = Effect.fn("tui.run")(function* () {
  const App = yield* TuiApp;

  yield* Effect.acquireUseRelease(
    Effect.promise(async (): Promise<TuiInstance> => {
      const renderer = await createCliRenderer({
        consoleMode: "disabled",
        exitOnCtrlC: true,
        screenMode: "alternate-screen",
      });
      const root = createRoot(renderer);
      const waitUntilExit = new Promise<void>((resolve) => {
        renderer.once(CliRenderEvents.DESTROY, () => resolve());
      });
      const unregisterTerminalController = setTuiTerminalController({
        resume: () => renderer.resume(),
        suspend: () => renderer.suspend(),
      });

      root.render(<App />);

      return { renderer, root, waitUntilExit, unregisterTerminalController };
    }),
    (instance) => Effect.promise(() => instance.waitUntilExit),
    (instance) =>
      Effect.sync(() => {
        instance.unregisterTerminalController();
        instance.root.unmount();

        if (!instance.renderer.isDestroyed) {
          instance.renderer.destroy();
        }
      }),
  );
});
