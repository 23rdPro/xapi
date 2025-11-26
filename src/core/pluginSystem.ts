import path from "path";
import type { ClientGenOptions } from "types/generators";

export interface CodegenPlugin {
  name: string;
  match(file: string, options?: ClientGenOptions): boolean;
  run(schemaPath: string, options: ClientGenOptions): Promise<void>;
}

const plugins: CodegenPlugin[] = [];

export function registerPlugin(plugin: CodegenPlugin) {
  if (plugins.some((p) => p.name === plugin.name)) {
    throw new Error(`Plugin with name "${plugin.name}" already registered`);
  }
  plugins.push(plugin);
}

function detectPlugin(schemaPath: string): CodegenPlugin {
  const ext = path.extname(schemaPath).toLowerCase();

  if (ext === ".graphql" || ext === ".gql") {
    const plugin = plugins.find((p) => p.name === "graphql");
    if (!plugin) throw new Error("❌ GraphQL plugin not registered");
    return plugin;
  }

  if (ext === ".yaml" || ext === ".yml" || ext === ".json") {
    const plugin = plugins.find((p) => p.name === "rest");
    if (!plugin) throw new Error("❌ REST plugin not registered");
    return plugin;
  }

  throw new Error(`❌ Unknown schema extension: ${ext}`);
}

export async function runPlugins(
  schemaPath: string,
  options: ClientGenOptions
) {
  const TYPE = detectPlugin(schemaPath);
  console.log(`🔍 Using plugin: ${TYPE.name}`);
  return TYPE.run(schemaPath, options);
}
