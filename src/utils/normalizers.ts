import { Param } from "types/endpoint";

/** Helper: normalize HTTP method names */
export const HTTP_METHODS = new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace",
]);

export function safeName(base: string, used: Set<string>) {
  let name = base;
  let i = 1;
  while (used.has(name)) {
    name = `${base}_${i++}`;
  }
  used.add(name);
  return name;
}

export function mkName(operationId?: string, method?: string, path?: string) {
  if (operationId) return operationId;
  const clean = (path || "").replace(/[\/{}]/g, " ").trim();
  const parts = `${method} ${clean}`.split(/\s+/).filter(Boolean);
  return parts
    .map((w, i) =>
      i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1)
    )
    .join("");
}

export function pickContent(schemaObj: any) {
  if (!schemaObj || !schemaObj.content) return null;
  // Prefer application/json, then first available
  if (schemaObj.content["application/json"]) {
    return {
      contentType: "application/json",
      schema: schemaObj.content["application/json"].schema,
    };
  }
  const first = Object.entries(schemaObj.content)[0];
  return {
    contentType: first ? (first[0] as string) : undefined,
    schema: first ? (first[1] as any).schema : undefined,
  };
}

export function mergeParameters(pathParams: any[] = [], opParams: any[] = []) {
  // operation-level params override path-level params with same name+in
  const map = new Map<string, any>();
  for (const p of pathParams || []) {
    map.set(`${p.name}::${p.in}`, p);
  }
  for (const p of opParams || []) {
    map.set(`${p.name}::${p.in}`, p);
  }
  return Array.from(map.values()).map((p: any) => ({
    name: p.name,
    in: p.in,
    required: !!p.required,
    schema: p.schema ?? p,
  })) as Param[];
}
