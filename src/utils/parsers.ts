import YAML from "yaml";

export function parseSchema(content: string, ext: string) {
  if (ext === ".yaml" || ext === ".yml") {
    return YAML.parse(content);
  }
  return JSON.parse(content);
}
