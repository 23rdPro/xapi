/**
 * ARCHIVE: Kept for reference, not used in production.
 * @deprecated Use `simpleSchemaToTS()` instead. Reason: lightweight
 * fallback mapper for common JSON-Schema shapes rather than a
 * full spec-compliant converter.
 */
export function schemaToTS(schema: any, typeName = "T"): string {
  if (!schema) return "any";

  const t = schema.type;
  if (schema.enum) {
    return schema.enum.map((v: any) => JSON.stringify(v)).join(" | ");
  }
  if (t === "string") return "string";
  if (t === "number" || t === "integer") return "number";
  if (t === "boolean") return "boolean";
  if (t === "array") {
    const item = schema.items
      ? schemaToTS(schema.items, `${typeName}Item`)
      : "any";
    return `${item}[]`;
  }
  if (
    t === "object" ||
    (schema.properties && typeof schema.properties === "object")
  ) {
    const props = schema.properties || {};
    const required = new Set(schema.required || []);
    const lines = Object.entries(props).map(([k, propSchema]) => {
      const tsType = schemaToTS(
        propSchema as any,
        `${typeName}${capitalize(k)}`
      );
      const optional = required.has(k) ? "" : "?";
      return `  ${k}${optional}: ${tsType};`;
    });
    return `{\n${lines.join("\n")}\n}`;
  }
  // fallback to any
  return "any";
}

export function capitalize(s: string) {
  return s ? s[0]?.toUpperCase() + s.slice(1) : s;
}

function sanitizeBase(base: string) {
  return base.replace(/[^a-zA-Z0-9_]/g, "_");
}

export function makeTypeName(base: string, suffix: string) {
  // sanitize and PascalCase
  const clean = sanitizeBase(base);
  return `${capitalize(clean)}${suffix}`;
}

export async function jsonSchemaToTS(
  schema: any,
  name: string
): Promise<{ code: string | null; exportedName?: string }> {
  /**
   * Attempt to use json-schema-to-typescript if installed.
   * We dynamically import so generator still works in minimal dev installs.
   */
  try {
    const mod = await import("json-schema-to-typescript");
    const res: string = await mod.compile(schema, name, { bannerComment: "" });
    // detect exported symbol name: "export interface Name" or "export type Name"
    const m = res.match(/export\s+(?:interface|type)\s+([A-Za-z0-9_]+)/);
    const exportedName = m ? m[1] : name;
    return { code: res, exportedName };
  } catch {
    return { code: null };
  }
}

/** Lightweight fallback mapping for common JSON Schema shapes */
export function simpleSchemaToTS(schema: any, typeName = "T"): string {
  if (!schema) return "any";
  if (schema.enum)
    return schema.enum.map((v: any) => JSON.stringify(v)).join(" | ");
  const t = schema.type;
  if (t === "string") return "string";
  if (t === "number" || t === "integer") return "number";
  if (t === "boolean") return "boolean";
  if (t === "array") {
    const item = schema.items
      ? simpleSchemaToTS(schema.items, `${typeName}Item`)
      : "any";
    return `${item}[]`;
  }
  if (t === "object" || schema.properties) {
    const props = schema.properties || {};
    const required = new Set(schema.required || []);
    const lines = Object.entries(props).map(([k, propSchema]) => {
      const tsType = simpleSchemaToTS(
        propSchema as any,
        `${typeName}${capitalize(k)}`
      );
      const optional = required.has(k) ? "" : "?";
      return `  ${k}${optional}: ${tsType};`;
    });
    return `{\n${lines.join("\n")}\n}`;
  }
  return "any";
}

/** Small Zod code emitter for common schema features
 * does not fully cover oneOf/anyOf/allOf —
 * @todo: implement with a clear strategy.
 */
export function schemaToZodCode(schema: any, varName = "S"): string {
  if (!schema) return "z.any()";
  if (schema.enum) {
    const literals = schema.enum
      .map((v: any) => `z.literal(${JSON.stringify(v)})`)
      .join(", ");
    return `z.union([${literals}])`;
  }
  if (schema.type === "string") return "z.string()";
  if (schema.type === "number" || schema.type === "integer")
    return "z.number()";
  if (schema.type === "boolean") return "z.boolean()";
  if (schema.type === "array") {
    const items = schema.items
      ? schemaToZodCode(schema.items, varName + "Item")
      : "z.any()";
    return `${items}.array()`;
  }
  if (schema.type === "object" || schema.properties) {
    const props = schema.properties || {};
    const lines = Object.entries(props).map(([k, propSchema]) => {
      const required = (schema.required || []).includes(k);
      const code = schemaToZodCode(propSchema as any, `${varName}_${k}`);
      return `  ${JSON.stringify(k)}: ${code}${required ? "" : ".optional()"}`;
    });
    return `z.object({\n${lines.join(",\n")}\n})`;
  }
  return "z.any()";
}
