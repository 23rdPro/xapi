import { describe, it, expect } from "vitest";
import { generateTypes } from "generators/typescript";
import type { Endpoint } from "types/endpoint";

describe("generateTypes", () => {
  it("generates request and response types for simple endpoints", async () => {
    const endpoints: Endpoint[] = [
      {
        id: "getPets",
        name: "getPets",
        method: "get",
        path: "/pets",
        params: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer" },
          },
        ],
        responses: [
          {
            status: "200",
            contentType: "application/json",
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: { id: { type: "integer" } },
                required: ["id"],
              },
            },
          },
        ],
      } as any,
    ];
    const out = await generateTypes(endpoints);
    expect(out).toMatch(/export\s+(?:type|interface)\s+GetPetsParams/);
    expect(out).toContain("export type GetPetsRequest");
    expect(out).toMatch(/export\s+(?:type|interface)\s+GetPetsResponse/);
    expect(out).toContain("id: number;");
  });
});

describe("generateTypes with zod", () => {
  it("emits zod schemas when opts.zod = true", async () => {
    const endpoints = [
      {
        id: "getPets",
        name: "getPets",
        method: "get",
        path: "/pets",
        params: [],
        responses: [
          {
            status: "200",
            contentType: "application/json",
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: { id: { type: "integer" } },
                required: ["id"],
              },
            },
          },
        ],
      } as any,
    ];
    const out = await generateTypes(endpoints, { zod: true });
    expect(out).toContain(`import { z } from "zod"`);
    expect(out).toMatch(/ResponseSchema/);
    expect(out).toContain("z.object");
  });
});
