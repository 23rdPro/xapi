import path from "node:path";

// export function getExtension(filePath: string) {
//   return path.extname(new URL(filePath, "file://").pathname).toLowerCase();
// }

// export function isUrl(str: string) {
//   try {
//     new URL(str);
//     return true;
//   } catch {
//     return false;
//   }
// }

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
