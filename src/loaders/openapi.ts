// Load .json or .yaml OpenAPI spec from: Local file or Remote URL
import fs from "node:fs/promises";
import path from "node:path";
import { getExtension, isUrl } from "utils/file";
import { parseSchema } from "utils/parsers";

export async function loadOpenAPISchema(fileOrUrl: string): Promise<any> {
  if (isUrl(fileOrUrl)) {
    const res = await fetch(fileOrUrl);
    if (!res.ok) throw new Error(`Failed to fetch schema from ${fileOrUrl}`);
    const text = await res.text();
    return parseSchema(text, getExtension(fileOrUrl));
  } else {
    const fullPath = path.resolve(fileOrUrl);
    const content = await fs.readFile(fullPath, "utf-8");
    return parseSchema(content, getExtension(fullPath));
  }
}
