import type { CodegenPlugin } from "core/pluginSystem";
import { generateGraphQLClient } from "generators/client";
import { generateGraphQLTypes } from "generators/typescript";
import { loadGraphQLSchema } from "loaders/graphql";
import { normalizeGraphQLSchema } from "normalizers/graphql";

export const graphqlPlugin: CodegenPlugin = {
  name: "graphql",
  match(file, options?) {
    return (
      file.endsWith(".graphql") ||
      file.endsWith(".gql") ||
      file.endsWith(".graphqls")
    );
  },
  async run(schemaPath, options) {
    const outDir = options?.outDir ?? "src/generated";
    const baseUrl = options?.baseUrl ?? "";
    const zod = Boolean(options?.zod);
    const prefix = options?.prefix;
    const schema = await loadGraphQLSchema(schemaPath);
    const endpoints = normalizeGraphQLSchema(schema);

    await generateGraphQLTypes(endpoints, {
      outputPath: `${outDir}/types.ts`,
      zod,
      prefix,
    });

    await generateGraphQLClient(endpoints, {
      outputPath: `${outDir}/client.ts`,
      baseUrl,
      wsUrl: options?.wsUrl,
      zod,
      prefix,
    });
  },
};
