import { GraphQLSchema } from "graphql";
import type { GraphQLEndpoint } from "types/endpoint";

export function normalizeGraphQLSchema(
  schema: GraphQLSchema
): GraphQLEndpoint[] {
  const typeMap = schema.getTypeMap();
  const endpoints: GraphQLEndpoint[] = [];

  const queryType = schema.getQueryType();
  if (queryType) {
    const fields = queryType.getFields();
    for (const [name] of Object.entries(fields)) {
      endpoints.push({
        operationType: "query",
        operationName: name,
        rawDocument: `query ${name} { ${name} }`,
      });
    }
  }

  const mutationType = schema.getMutationType();
  if (mutationType) {
    const fields = mutationType.getFields();
    for (const [name] of Object.entries(fields)) {
      endpoints.push({
        operationType: "mutation",
        operationName: name,
        rawDocument: `mutation ${name} { ${name} }`,
      });
    }
  }

  const subscriptionType = schema.getSubscriptionType();
  if (subscriptionType) {
    const fields = subscriptionType.getFields();
    for (const [name] of Object.entries(fields)) {
      endpoints.push({
        operationType: "subscription",
        operationName: name,
        rawDocument: `subscription ${name} { ${name} }`,
      });
    }
  }

  return endpoints;
}
