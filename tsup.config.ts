import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"], // import.meta
  dts: true,
  banner: { js: "#!/usr/bin/env node" },
  platform: "node",
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  external: ["yaml"],
});
