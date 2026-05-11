import { defineConfig } from "tsdown/config";

export default defineConfig({
  entry: "src/index.ts",
  format: "esm",
  platform: "node",
  target: "node24",
  outDir: "dist",
  deps: {
    skipNodeModulesBundle: true,
  },
  fixedExtension: false,
  dts: true,
  sourcemap: true,
  clean: true,
  hash: false,
});
