import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLField,
  isObjectType,
  isScalarType,
  GraphQLType,
  isNonNullType,
  isListType,
} from "graphql";
import type { Endpoint } from "types/endpoint";

/**
 * Parse a GraphQLSchema into a list of normalized Endpoints
 * Each query/mutation/subscription → one Endpoint
 */
export function parseGraphQLSchema(
  schema: GraphQLSchema,
  opts: { path?: string } = {}
): Endpoint[] {
  const path = opts.path ?? "/graphql";
  const endpoints: Endpoint[] = [];
  const queryType = schema.getQueryType();
  const mutationType = schema.getMutationType();
  const subscriptionType = schema.getSubscriptionType();
  if (queryType) {
    endpoints.push(
      ...mapFieldsToEndpoints("query", queryType, path, "Fetch a query")
    );
  }
  if (mutationType) {
    endpoints.push(
      ...mapFieldsToEndpoints(
        "mutation",
        mutationType,
        path,
        "Execute a mutation"
      )
    );
  }
  if (subscriptionType) {
    endpoints.push(
      ...mapFieldsToEndpoints(
        "subscription",
        subscriptionType,
        path,
        "Open a subscription"
      )
    );
  }
  return endpoints;
}

/**
 * Convert a GraphQL object type fields into Endpoints
 */
function mapFieldsToEndpoints(
  parentKind: "query" | "mutation" | "subscription",
  type: GraphQLObjectType,
  path: string,
  descriptionPrefix: string
): Endpoint[] {
  const fields = type.getFields();
  return Object.values(fields).map((field) =>
    fieldToEndpoint(parentKind, field, path, descriptionPrefix)
  );
}

/**
 * Map a single GraphQL field into an Endpoint
 */
function fieldToEndpoint(
  parentKind: "query" | "mutation" | "subscription",
  field: GraphQLField<any, any>,
  path: string,
  descriptionPrefix: string
): Endpoint {
  const id = `${parentKind}_${field.name}`;
  const argsSchema = {
    type: "object",
    properties: Object.fromEntries(
      field.args.map((arg) => [
        arg.name,
        { type: mapGraphQLTypeToJSONType(arg.type) },
      ])
    ),
    required: field.args
      .filter((a) => isNonNullType(a.type))
      .map((a) => a.name),
  };
  // Represent response as JSON schema
  const responseSchema = {
    type: "object",
    properties: {
      data: { type: "object" },
      errors: { type: "array", items: { type: "object" } },
    },
  };

  return {
    id,
    name: field.name,
    method: "post",
    path,
    description: `${descriptionPrefix}: ${field.name}`,
    params: [],
    requestBody: undefined,
    responses: [],
    graphql: {
      operationType: parentKind,
      operationName: field.name,
      requestSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          variables: argsSchema,
        },
        required: ["query"],
      },
      responseSchema,
      /** @todo embed actual SDL string */
      rawDocument: undefined,
    },
  };
}

/**
 * Map GraphQL scalar types into JSON schema types
 */
function mapGraphQLTypeToJSONType(type: GraphQLType): string {
  if (isNonNullType(type)) return mapGraphQLTypeToJSONType(type.ofType);
  if (isListType(type)) return "array";
  if (isObjectType(type)) return "object";
  if (isScalarType(type)) {
    switch (type.name) {
      case "Int":
      case "Float":
        return "number";
      case "Boolean":
        return "boolean";
      case "String":
      case "ID":
      default:
        return "string";
    }
  }
  return "object";
}
