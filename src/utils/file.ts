import path from "node:path";
import fs from "node:fs/promises";

export function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function getExtension(filePath: string): string {
  if (isUrl(filePath)) {
    try {
      const url = new URL(filePath);
      return path.extname(url.pathname).toLowerCase();
    } catch {
      return ""; // fallback
    }
  }
  return path.extname(filePath).toLowerCase();
}

export async function loadRawContent(fileOrUrl: string): Promise<string> {
  if (isUrl(fileOrUrl)) {
    const res = await fetch(fileOrUrl);
    if (!res.ok) throw new Error(`Failed to fetch: ${fileOrUrl}`);
    return res.text();
  } else {
    const fullPath = path.resolve(fileOrUrl);
    return fs.readFile(fullPath, "utf8");
  }
}
