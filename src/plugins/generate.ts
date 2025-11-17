import type { CodegenPlugin } from "core/pluginSystem";
import { generateClient } from "generators/client";
import { generateTypes } from "generators/typescript";
import { loadOpenAPISchema } from "loaders/openapi";
import { normalizeOpenAPISchema } from "normalizers/openapi";
import type { GenOptions } from "types/generators";

export const generatePlugin: CodegenPlugin = {
  name: "generate",

  match() {
    return false;
  },

  async run(schemaPath: string, options: GenOptions & { outDir?: string }) {
    const fs = await import("fs");

    let finalPath = schemaPath;
    if (!/^https?:\/\//.test(finalPath) && !fs.existsSync(finalPath)) {
      console.log(
        "⚠ Schema not found for 'generate' plugin. Falling back to Petstore."
      );
      finalPath = "./tests/fixtures/petstore.yaml";
    }

    console.log("🔍 Loading schema from", finalPath);
    const schema = await loadOpenAPISchema(finalPath);
    console.log("🧩 Normalizing schema...");
    const endpoints = normalizeOpenAPISchema(schema);
    const outDir = options?.outputPath ?? options.outDir ?? "src/generated";
    const httpLibrary = options.httpLibrary ?? "fetch";

    console.log("✏️ Generating types...");
    await generateTypes(endpoints, {
      outputPath: `${outDir}/types.ts`,
      zod: options.zod,
      prefix: options.prefix,
    });

    console.log("🚀 Generating client...");
    await generateClient(endpoints, {
      outputPath: `${outDir}/client.ts`,
      baseUrl: options.baseUrl,
      wsUrl: options.wsUrl,
      zod: options.zod,
      prefix: options.prefix,
      httpLibrary,
    });

    console.log("✅ Generation complete!");
  },
};
