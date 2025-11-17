import type { ClientGenOptions } from "types/generators";
import { createRequire } from "module";
import { registerPlugin, runPlugins } from "core/pluginSystem";
import { graphqlPlugin } from "plugins/graphql";
import { restPlugin } from "plugins/rest";
import { withSpinner } from "utils/spinner";
import { fileURLToPath } from "url";
import path from "path";
import { generatePlugin } from "plugins/generate";

const LIB_MAP: Record<
  Exclude<ClientGenOptions["httpLibrary"], undefined>,
  string
> = {
  fetch: "fetch",
  axios: "axios",
  rtk: "@reduxjs/toolkit",
  tanstack: "@tanstack/react-query",
};
export class MissingDependencyError extends Error {
  constructor(lib: string, pkg: string) {
    super(`Missing dependency: ${lib} → ${pkg}`);
    this.name = "MissingDependencyError";
  }
}
/**
 * Ensure the requested http library's package is installed.
 * Uses global require.resolve (if present) so tests can stub it.
 * Falls back to createRequire(import.meta.url).resolve for pure ESM runtimes.
 * Synchronous and throws MissingDependencyError when not found.
 */
export function ensureHttpLibInstalled(
  lib: Exclude<ClientGenOptions["httpLibrary"], undefined>
) {
  if (lib === "fetch") return true;
  const pkg = LIB_MAP[lib];

  try {
    const globalRequire = (globalThis as any).require;
    if (globalRequire && typeof globalRequire.resolve === "function") {
      globalRequire.resolve(pkg);
    } else {
      const requireFromThisFile = createRequire(import.meta.url);
      requireFromThisFile.resolve(pkg);
    }
    return true;
  } catch {
    throw new MissingDependencyError(lib, pkg);
  }
}
export { main };

async function main() {
  const args = process.argv.slice(2);

  let schemaPath = "./openapi.yaml";
  let command = "generate";

  if (args.length > 0) {
    const first = args[0];

    // If first arg looks like a file → treat it as schema
    if (/\.(json|yaml|yml)$/i.test(first)) {
      schemaPath = first;
    } else {
      // otherwise treat as a command
      command = first;
      schemaPath = args[1] || schemaPath;
    }
  }

  const rawLib =
    (/\.(json|yaml|yml|graphql|gql)$/i.test(args[0]) ? args[1] : args[2]) ??
    undefined;

  const httpLib: Exclude<ClientGenOptions["httpLibrary"], undefined> =
    (rawLib as any) || "fetch";

  await withSpinner("Checking dependencies...", async () => {
    ensureHttpLibInstalled(httpLib);
  });

  if (command === "generate") {
    await withSpinner("Running generate plugin...", async () => {
      await generatePlugin.run(schemaPath, {
        outDir: "src/generated",
        outputPath: "src/generated",
        baseUrl: "https://api.example.com",
        httpLibrary: httpLib,
        zod: true,
        prefix: undefined,
        wsUrl: undefined,
      });
    });
    console.log("✅ Codegen complete!");
    return;
  }

  // Register available plugins
  await withSpinner("Registering plugins...", async () => {
    registerPlugin(restPlugin);
    registerPlugin(graphqlPlugin);
  });

  const pluginOptions = {
    outDir: "src/generated",
    baseUrl: "https://api.example.com",
    httpLibrary: httpLib,
    zod: true,
  };

  await withSpinner(`Running plugins for ${schemaPath}...`, async () => {
    await runPlugins(schemaPath, pluginOptions);
  });

  console.log(`✅ Codegen complete for ${schemaPath}`);
}

// ---------------------------------------------------------------------------
// Auto-run if called directly from CLI
// ---------------------------------------------------------------------------
const currentFile = fileURLToPath(import.meta.url);
if (path.resolve(currentFile) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
