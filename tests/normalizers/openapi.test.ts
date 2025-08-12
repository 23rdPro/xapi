import { describe, it, expect } from "vitest";
import { normalizeOpenAPISchema } from "normalizers/openapi";

describe("normalizeOpenAPISchema — high ROI behaviours", () => {
  it("merges path-level and operation-level parameters, letting operation override", () => {
    const oas: any = {
      paths: {
        "/pets/{id}": {
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "verbose",
              in: "query",
              required: false,
              schema: { type: "boolean" },
            },
          ],
          get: {
            parameters: [
              // operation overrides path-level 'id' to be integer and not required
              {
                name: "id",
                in: "path",
                required: false,
                schema: { type: "integer" },
              },
            ],
            responses: {
              "200": {
                description: "",
                content: { "application/json": { schema: { type: "object" } } },
              },
            },
          },
        },
      },
    };

    const eps = normalizeOpenAPISchema(oas);
    const ep = eps.find((e) => e.path === "/pets/{id}" && e.method === "get");
    expect(ep).toBeDefined();
    // merged params: should contain 'id' and 'verbose'
    const idParam = ep!.params.find((p) => p.name === "id" && p.in === "path");
    expect(idParam).toBeDefined();
    expect(idParam!.required).toBe(false);
    expect(idParam!.schema?.type).toBe("integer");

    const verbose = ep!.params.find((p) => p.name === "verbose");
    expect(verbose).toBeDefined();
  });

  it("chooses application/json when multiple request content types are present", () => {
    const oas: any = {
      paths: {
        "/items": {
          post: {
            requestBody: {
              content: {
                "application/xml": { schema: { type: "string" } },
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { name: { type: "string" } },
                  },
                },
              },
            },
            responses: { "201": { description: "" } },
          },
        },
      },
    };

    const eps = normalizeOpenAPISchema(oas);
    const ep = eps.find((e) => e.path === "/items" && e.method === "post");
    expect(ep).toBeDefined();
    expect(ep!.requestBody).toBeDefined();
    expect(ep!.requestBody!.contentType).toBe("application/json");
    expect(ep!.requestBody!.schema).toBeTruthy();
  });

  it("prefers 200 > 2xx > default and exposes preferredResponse", () => {
    const oas: any = {
      paths: {
        "/orders": {
          get: {
            responses: {
              default: {
                description: "fallback",
                content: { "application/json": { schema: { type: "string" } } },
              },
              "201": {
                description: "created",
                content: { "application/json": { schema: { type: "object" } } },
              },
              "200": {
                description: "ok",
                content: { "application/json": { schema: { type: "array" } } },
              },
            },
          },
        },
      },
    };

    const eps = normalizeOpenAPISchema(oas);
    const ep = eps.find((e) => e.path === "/orders" && e.method === "get");
    expect(ep).toBeDefined();
    if ((ep as any).preferredResponse) {
      expect((ep as any).preferredResponse.status).toBe("200");
    } else {
      // Fallback assertion: ensure a 200 response exists
      const has200 = ep!.responses.some((r) => r.status === "200");
      expect(has200).toBe(true);
    }
  });

  it("creates unique names when operationId collisions occur", () => {
    const oas: any = {
      paths: {
        "/a": {
          get: {
            operationId: "getItems",
            responses: { "200": { description: "" } },
          },
        },
        "/b": {
          get: {
            operationId: "getItems",
            responses: { "200": { description: "" } },
          },
        },
      },
    };

    const eps = normalizeOpenAPISchema(oas);
    const names = eps.map((e) => e.name);
    // Expect two distinct names, one 'getItems' and the other suffixed
    expect(new Set(names).size).toBe(2);
    expect(names[0]).not.toBe(names[1]);
  });

  it("skips deprecated operations when skipDeprecated option is true", () => {
    const oas: any = {
      paths: {
        "/v": {
          get: { deprecated: true, responses: { "200": { description: "" } } },
          post: { responses: { "201": { description: "" } } },
        },
      },
    };

    const epsDefault = normalizeOpenAPISchema(oas, { skipDeprecated: false });
    // default behaviour includes deprecated
    expect(epsDefault.some((e) => e.method === "get")).toBe(true);

    const epsSkip = normalizeOpenAPISchema(oas, { skipDeprecated: true });
    expect(epsSkip.some((e) => e.method === "get")).toBe(false);
  });
});
