import path from "node:path";

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
