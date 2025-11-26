import type { Endpoint } from "types/endpoint";
export class GraphQLWebSocketClient {
  private socket: WebSocket;
  private idCounter = 1;
  private subscriptions = new Map<number, (data: any) => void>();

  constructor(url: string) {
    this.socket = new WebSocket(url, "graphql-ws");
    this.socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.subscriptions.has(Number(msg.id))) {
        this.subscriptions.get(Number(msg.id))?.(msg.payload.data);
      }
    };
    this.socket.onopen = () => {
      this.socket.send(JSON.stringify({ type: "connection_init" }));
    };
  }
  subscribe(
    query: string,
    variables: Record<string, any>,
    onData: (data: any) => void
  ) {
    const id = this.idCounter++;
    this.subscriptions.set(id, onData);
    this.socket.send(
      JSON.stringify({
        id: String(id),
        type: "start",
        payload: { query, variables },
      })
    );
    return () => {
      this.socket.send(JSON.stringify({ id: String(id), type: "stop" }));
      this.subscriptions.delete(id);
    };
  }
}
/**
 * ARCHIVE: Kept for reference only.
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
   * dynamically import so generator still works in minimal dev installs.
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
/**
 * Convert a JSON Schema object into a Zod schema string.
 * Handles oneOf/anyOf/allOf, enums, constraints, objects, arrays, scalars.
 */
export function schemaToZodCode(schema: any, varName = "S"): string {
  if (!schema) return "z.any()";

  if (schema.oneOf) {
    const parts = schema.oneOf.map((s: any, i: number) =>
      schemaToZodCode(s, `${varName}One${i}`)
    );
    return `z.union([${parts.join(", ")}])`;
  }

  if (schema.anyOf) {
    const parts = schema.anyOf.map((s: any, i: number) =>
      schemaToZodCode(s, `${varName}Any${i}`)
    );
    return `z.union([${parts.join(", ")}])`;
  }

  if (schema.allOf) {
    const parts = schema.allOf.map((s: any, i: number) =>
      schemaToZodCode(s, `${varName}All${i}`)
    );
    const allObjects = parts.every((p: string) =>
      p.trim().startsWith("z.object(")
    );
    if (allObjects && parts.length > 0) {
      return parts
        .slice(1)
        .reduce((acc: string, cur: string) => `${acc}.merge(${cur})`, parts[0]);
    }
    return parts.reduce(
      (acc: string, cur: string) => `z.intersection(${acc}, ${cur})`
    );
  }

  if (schema.enum) {
    if (schema.enum.length === 1) {
      return `z.literal(${JSON.stringify(schema.enum[0])})`;
    }
    const literals = schema.enum
      .map((v: any) => `z.literal(${JSON.stringify(v)})`)
      .join(", ");
    return `z.union([${literals}])`;
  }

  if (schema.type === "string") {
    if (schema.format === "date-time") return "z.string().datetime()";
    if (schema.format === "email") return "z.string().email()";
    return "z.string()";
  }

  if (schema.type === "number" || schema.type === "integer") {
    let code = "z.number()";
    if (typeof schema.minimum === "number") code += `.min(${schema.minimum})`;
    if (typeof schema.maximum === "number") code += `.max(${schema.maximum})`;
    return code;
  }

  if (schema.type === "boolean") return "z.boolean()";

  if (schema.type === "array") {
    const items = schema.items
      ? schemaToZodCode(schema.items, `${varName}Item`)
      : "z.any()";
    let code = `z.array(${items})`;
    if (typeof schema.minItems === "number") code += `.min(${schema.minItems})`;
    if (typeof schema.maxItems === "number") code += `.max(${schema.maxItems})`;
    return code;
  }

  if (schema.type === "object" || schema.properties) {
    const props = schema.properties || {};
    const required = new Set(schema.required || []);
    const lines = Object.entries(props).map(([k, propSchema]) => {
      const zType = schemaToZodCode(
        propSchema as any,
        `${varName}_${capitalize(k)}`
      );
      return required.has(k)
        ? `  ${JSON.stringify(k)}: ${zType}`
        : `  ${JSON.stringify(k)}: ${zType}.optional()`;
    });
    let obj = `z.object({\n${lines.join(",\n")}\n})`;
    if (schema.nullable) obj = `${obj}.nullable()`;
    return obj;
  }
  return "z.any()";
}

export function makePathTemplate(ep: Endpoint): string {
  return "`" + ep.path.replace(/{(.*?)}/g, "${params.$1}") + "`";
}

/** Wraps any error into ApiError */
export function toApiError(e: any, fallbackStatus = 500): string {
  return [
    `      const err = new Error(e?.message ?? "HTTP ${fallbackStatus}") as ApiError;`,
    `      err.status = e?.response?.status ?? ${fallbackStatus};`,
    `      err.body = e?.response?.data ?? undefined;`,
    `      throw err;`,
  ].join("\n");
}
