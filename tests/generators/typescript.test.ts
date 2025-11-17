import { describe, it, expect } from "vitest";
import { generateGraphQLTypes, generateTypes } from "generators/typescript";
import type { Endpoint, GraphQLEndpoint } from "types/endpoint";

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

describe("generateGraphQLTypes", () => {
  it("generates types for GraphQL endpoints with schemas", async () => {
    const endpoints: GraphQLEndpoint[] = [
      {
        operationName: "GetUser",
        operationType: "query",
        requestSchema: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        responseSchema: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
              },
            },
          },
        },
      },
    ];
    const out = await generateGraphQLTypes(endpoints, { prefix: "GQL" });

    expect(out).toContain("export type GQLGetUserRequest");
    expect(out).toContain("export type GQLGetUserResponse");
  });

  it("handles endpoints without request schema", async () => {
    const endpoints: GraphQLEndpoint[] = [
      {
        operationName: "ListUsers",
        operationType: "query",
        requestSchema: undefined,
        responseSchema: {
          type: "array",
          items: { type: "string" },
        },
      },
    ];

    const out = await generateGraphQLTypes(endpoints);
    expect(out).toContain("export type GQLListUsersResponse");
    expect(out).toContain("Request = void;");
  });
});
