import type { ClientGenOptions } from "types/generators";

export interface CodegenPlugin {
  name: string;
  match(file: string, options?: ClientGenOptions): boolean;
  run(schemaPath: string, options: ClientGenOptions): Promise<void>;
}

const plugins: CodegenPlugin[] = [];

export function registerPlugin(plugin: CodegenPlugin) {
  plugins.push(plugin);
}

export async function runPlugins(
  schemaPath: string,
  options: ClientGenOptions
) {
  for (const plugin of plugins) {
    if (plugin.match(schemaPath, options)) {
      return plugin.run(schemaPath, options);
    }
  }
  throw new Error(`No plugin found to handle schema: ${schemaPath}`);
}
