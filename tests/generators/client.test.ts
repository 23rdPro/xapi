import { describe, it, expect } from "vitest";
import { generateClient } from "generators/client";
import { sampleEndpoints, type Endpoint } from "types/endpoint";

describe("generateClient", () => {
  it("generates a fetch-based client function by default", async () => {
    const code = await generateClient(sampleEndpoints, {
      baseUrl: "https://api.test",
    });
    expect(code).toContain(`method: "get"`);
    expect(code).toContain("export const client");
    expect(code).toContain("fetch(BASE_URL + opts.path");
    expect(code).toContain("export async function getPet");
  });

  it("handles endpoints without params or body", async () => {
    const endpoints: Endpoint[] = [
      {
        id: "listUsers",
        name: "listUsers",
        method: "get",
        path: "/users",
        params: [],
        responses: [
          {
            status: "200",
            schema: { type: "array", items: { type: "string" } },
          },
        ],
      },
    ];

    const code = await generateClient(endpoints, {});
    expect(code).toContain(`export async function listUsers`);
    expect(code).toContain("path: `/users`");
  });

  it("uses a configurable baseUrl", async () => {
    const endpoints: Endpoint[] = [
      {
        id: "ping",
        name: "ping",
        method: "get",
        path: "/ping",
        params: [],
        responses: [{ status: "200", schema: { type: "string" } }],
      },
    ];

    const code = await generateClient(endpoints, {
      baseUrl: "https://api.example.com",
    });

    expect(code).toContain(`const BASE_URL = "https://api.example.com"`);
    expect(code).toContain(`fetch(BASE_URL + opts.path`);
  });

  it("generates axios client", async () => {
    const code = await generateClient(sampleEndpoints, {
      httpLibrary: "axios",
    });
    expect(code).toContain("import axios from");
    expect(code).toContain("axios.request");
  });

  it("generates RTK api slice", async () => {
    const code = await generateClient(sampleEndpoints, { httpLibrary: "rtk" });
    expect(code).toContain("createApi");
    expect(code).toContain("useGetPetQuery");
    expect(code).not.toContain("export async function getPet");
  });

  it("generates TanStack hooks", async () => {
    const code = await generateClient(sampleEndpoints, {
      httpLibrary: "tanstack",
    });
    expect(code).toContain("useQuery");
    expect(code).toContain("export function useGetPet");
    expect(code).not.toContain("export async function getPet");
  });
});
