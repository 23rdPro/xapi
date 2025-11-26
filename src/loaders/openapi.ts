// Load .json or .yaml OpenAPI spec from: Local file or Remote URL
import { getExtension, loadRawContent } from "utils/file";
import { parseSchema } from "utils/parsers";

export async function loadOpenAPISchema(fileOrUrl: string): Promise<any> {
  const content = await loadRawContent(fileOrUrl);
  return parseSchema(content, getExtension(fileOrUrl));
}
