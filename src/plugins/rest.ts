import { CodegenPlugin } from "core/pluginSystem";
import { generateClient } from "generators/client";
import { generateTypes } from "generators/typescript";
import { loadOpenAPISchema } from "loaders/openapi";
import { normalizeOpenAPISchema } from "normalizers/openapi";
import parseOpenAPISchema from "parsers/openapi";

export const restPlugin: CodegenPlugin = {
  name: "rest",
  match(file) {
    return (
      file.endsWith(".yaml") || file.endsWith(".json") || file.endsWith(".yml")
    );
  },
  async run(schemaPath, options) {
    const outDir = options?.outDir ?? "src/generated";
    const baseUrl = options?.baseUrl ?? "";
    const httpLibrary = options?.httpLibrary ?? "fetch";
    const zod = Boolean(options?.zod);
    const prefix = options?.prefix;

    const spec = await loadOpenAPISchema(schemaPath);
    const parsed = await parseOpenAPISchema(spec);
    const endpoints = normalizeOpenAPISchema(parsed);

    await generateTypes(endpoints, {
      outputPath: `${outDir}/types.ts`,
      zod,
      prefix,
    });

    await generateClient(endpoints, {
      outputPath: `${outDir}/client.ts`,
      baseUrl,
      httpLibrary,
      zod,
      prefix,
    });
  },
};
