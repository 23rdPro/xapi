import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { parseOpenAPISchema } from "parsers/openapi";

describe("parseOpenAPISchema", () => {
  it("dereferences and validates a local JSON schema (object input)", async () => {
    const file = path.resolve(__dirname, "../fixtures/petstore.json");
    const raw = JSON.parse(await fs.readFile(file, "utf8"));
    const parsed = await parseOpenAPISchema(raw);
    expect(parsed).toBeTruthy();
    expect(parsed).toHaveProperty("openapi");
    expect(parsed).toHaveProperty("paths");
  });

  it("works with a YAML schema (raw string input)", async () => {
    const file = path.resolve(__dirname, "../fixtures/petstore.yaml");
    const rawText = await fs.readFile(file, "utf8");
    const parsed = await parseOpenAPISchema(rawText); // raw YAML string
    expect(parsed).toBeTruthy();
    expect(parsed).toHaveProperty("openapi");
    expect(parsed).toHaveProperty("paths");
  });

  it("accepts a file path string and lets SwaggerParser read it", async () => {
    const file = path.resolve(__dirname, "../fixtures/petstore.json");
    // pass file path string; SwaggerParser can accept a file path
    const parsed = await parseOpenAPISchema(file);
    expect(parsed).toBeTruthy();
    expect(parsed).toHaveProperty("openapi");
    expect(parsed).toHaveProperty("paths");
  });
});
