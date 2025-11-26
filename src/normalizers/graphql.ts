import { GraphQLSchema } from "graphql";
import type { GraphQLEndpoint } from "types/endpoint";

export function normalizeGraphQLSchema(
  schema: GraphQLSchema
): GraphQLEndpoint[] {
  const endpoints: GraphQLEndpoint[] = [];

  const types = [
    { type: schema.getQueryType(), kind: "query" as const },
    { type: schema.getMutationType(), kind: "mutation" as const },
    { type: schema.getSubscriptionType(), kind: "subscription" as const },
  ];

  for (const { type, kind } of types) {
    if (!type) continue;
    const fields = type.getFields();
    for (const [name, field] of Object.entries(fields)) {
      endpoints.push({
        name,
        operationId: name,
        method: "POST", // all GraphQL go to /graphql
        path: "/graphql",
        operationType: kind,
        operationName: name,
        graphql: {
          kind,
          field: name,
        },
        requestSchema: field.args,
        responseSchema: field.type,
        request: {
          type: "object",
          schema: field.args ?? [],
        },
        response: {
          type: field.type?.toString() ?? "any",
          schema: field.type,
        },
      });
    }
  }

  return endpoints;
}
