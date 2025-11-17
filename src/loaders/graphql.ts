import {
  buildSchema,
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLSchema,
} from "graphql";
import { getExtension, loadRawContent } from "utils/file";

/**
 * Detects schema type and loads it into a GraphQLSchema object.
 * Supports:
 *   .graphql / .gql (SDL string)
 *   .json (introspection result)
 */
export async function loadGraphQLSchema(
  source: string
): Promise<GraphQLSchema> {
  const ext = getExtension(source);
  const raw = await loadRawContent(source);

  if (ext === ".graphql" || ext === ".gql") {
    return buildSchema(raw);
  }
  if (ext === ".json") {
    const json = JSON.parse(raw);
    const introspection = json.data?.__schema ? json.data : json;
    return buildClientSchema(introspection);
  }
  throw new Error(`Unsupported GraphQL schema format: ${ext}`);
}

/**
 * Convenience: return the standard introspection query string
 * so users can fetch schema from remote GraphQL servers.
 */
export function getIntrospectionQueryString(): string {
  return getIntrospectionQuery();
}
