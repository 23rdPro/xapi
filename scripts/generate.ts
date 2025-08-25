import { generateClient } from "generators/client";
import { generateTypes } from "generators/typescript";
import { loadOpenAPISchema } from "loaders/openapi";
import { normalizeOpenAPISchema } from "normalizers/openapi";
import parseOpenAPISchema from "parsers/openapi";
import type { ClientGenOptions } from "types/generators";
import { createRequire } from "module";
import { fileURLToPath } from "url";

export { main };

const httpLib: Exclude<ClientGenOptions["httpLibrary"], undefined> =
  (process.argv[3] as ClientGenOptions["httpLibrary"]) ?? "fetch";

async function main() {
  const spec = await loadOpenAPISchema(process.argv[2] || "./openapi.yaml");
  const parsed = await parseOpenAPISchema(spec);
  const endpoints = normalizeOpenAPISchema(parsed);
  await generateTypes(endpoints, {
    outputPath: "src/generated/types.ts",
    zod: true,
  });
  console.log("generated src/generated/types.ts");

  ensureHttpLibInstalled(httpLib);

  await generateClient(endpoints, {
    outputPath: "src/generated/clients.ts",
    baseUrl: "https://api.example.com",
    httpLibrary: httpLib,
  });
  console.log("generated src/generated/client.ts");
}

// run main when this file is executed directly from node (CLI).
const entryScript = process.argv[1];
const thisFile = fileURLToPath(import.meta.url);

if (entryScript === thisFile) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

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
    // Prefer global require.resolve if available (easy to stub in tests).
    const globalRequire = (globalThis as any).require;
    if (globalRequire && typeof globalRequire.resolve === "function") {
      globalRequire.resolve(pkg);
    } else {
      // Fallback for strict ESM environments
      const requireFromThisFile = createRequire(import.meta.url);
      requireFromThisFile.resolve(pkg);
    }
    return true;
  } catch {
    throw new MissingDependencyError(lib, pkg);
  }
}
