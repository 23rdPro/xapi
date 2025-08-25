// Take the raw OpenAPI object and produce a uniform list of endpoints
// makes it easy to plug into type generation and client code generation.
import type { Endpoint, Body, Response } from "types/endpoint";
import {
  HTTP_METHODS,
  mergeParameters,
  pickContent,
  mkName,
  safeName,
} from "utils/normalizers";

export function normalizeOpenAPISchema(
  oas: any,
  opts?: { skipDeprecated?: boolean }
) {
  const endpoints: Endpoint[] = [];
  const usedNames = new Set<string>();

  for (const [pathStr, pathItem] of Object.entries(oas.paths || {})) {
    // pathItem may contain parameters valid at path level
    const pathLevelParams = (pathItem as any).parameters || [];

    for (const [rawMethod, op] of Object.entries(pathItem as any)) {
      const method = rawMethod.toLowerCase();
      if (!HTTP_METHODS.has(method)) continue;
      const operation = op as any;
      if (opts?.skipDeprecated && operation.deprecated) continue;

      // Merge params: path-level + operation-level (operation overrides)
      const params = mergeParameters(pathLevelParams, operation.parameters);

      // Request body: choose best content
      const requestBody = pickContent(operation.requestBody);

      // Responses: collect and pick preferred
      const responses: Response[] = [];
      for (const [status, resp] of Object.entries(operation.responses || {})) {
        const picked = pickContent(resp as any);
        responses.push({
          status,
          contentType: picked?.contentType,
          schema: picked?.schema,
        } as Response);
      }

      // Prefer response with 200 > 2xx > default > first
      let preferredResponse = responses.find((r) => r.status === "200");
      if (!preferredResponse)
        preferredResponse = responses.find((r) => /^2\d\d$/.test(r.status));
      if (!preferredResponse)
        preferredResponse = responses.find((r) => r.status === "default");
      if (!preferredResponse) preferredResponse = responses[0];

      const baseName = mkName(operation.operationId, method, pathStr);
      const name = safeName(baseName, usedNames);
      const id = operation.operationId || name;

      endpoints.push({
        id,
        name,
        method: method as any,
        path: pathStr,
        summary: operation.summary,
        description: operation.description,
        params,
        requestBody: requestBody ? (requestBody as Body) : undefined,
        responses,
        preferredResponse,
        deprecated: !!operation.deprecated,
      } as any);
    }
  }

  return endpoints;
}
