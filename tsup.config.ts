import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"], // import.meta
  dts: true,
  banner: { js: "#!/usr/bin/env node" },
  platform: "node",
  splitting: false,
  sourcemap: false,
  clean: true,
  outDir: "dist",
  external: ["yaml"],
});
