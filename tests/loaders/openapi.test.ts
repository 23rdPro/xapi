import { describe, it, expect } from "vitest";
import { loadOpenAPISchema } from "../../src/loaders/openapi";
import path from "node:path";

describe("loadOpenAPISchema", () => {
  it("should load a local JSON schema", async () => {
    const schemaPath = path.resolve(__dirname, "../fixtures/petstore.json");
    const schema = await loadOpenAPISchema(schemaPath);
    expect(schema).toHaveProperty("openapi");
    expect(schema).toHaveProperty("paths");
  });

  it("should load a local YAML schema", async () => {
    const schemaPath = path.resolve(__dirname, "../fixtures/petstore.yaml");
    const schema = await loadOpenAPISchema(schemaPath);
    expect(schema).toHaveProperty("openapi");
    expect(schema).toHaveProperty("paths");
  });

  it("should load a remote JSON schema", async () => {
    const url = "https://petstore3.swagger.io/api/v3/openapi.json";
    const schema = await loadOpenAPISchema(url);
    expect(schema).toHaveProperty("openapi");
    expect(schema).toHaveProperty("paths");
  }, 20000);
});
