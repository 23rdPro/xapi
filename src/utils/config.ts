import fs from "fs";
import path from "path";
import { z } from "zod";

const ConfigSchema = z.object({
  httpLibrary: z.enum(["fetch", "axios", "rtk", "tanstack"]).default("fetch"),
  output: z.string().default("src/generated"),
  zod: z.boolean().default(false),
  client: z.boolean().default(true),
});

export type XapiConfig = z.infer<typeof ConfigSchema>;

export function loadConfig(cwd = process.cwd()): XapiConfig {
  // 1. Try xapi.config.ts/js
  const configPath = ["xapi.config.ts", "xapi.config.js"]
    .map((f) => path.join(cwd, f))
    .find(fs.existsSync);
  if (configPath) {
    const mod = require(configPath);
    const cfg = mod.default || mod;
    return ConfigSchema.parse(cfg);
  }

  // 2. Try package.json
  const pkgPath = path.join(cwd, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    if (pkg.xapi) return ConfigSchema.parse(pkg.xapi);
  }

  // 3. Defaults
  return ConfigSchema.parse({});
}
