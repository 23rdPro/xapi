#!/usr/bin/env node

/**
 * xAPI Usage Examples
 *
 * This file demonstrates how to use @23rdpro/xapi to generate
 * type-safe API clients from OpenAPI and GraphQL schemas.
 *
 * Examples include:
 * - Generating REST clients (fetch, axios, RTK, TanStack)
 * - Generating GraphQL clients with subscriptions
 * - Working with the programmatic API
 * - Using Zod validators for runtime validation
 */

import { generateClient, generateGraphQLClient } from './dist/client.js';
import { generateTypes, generateGraphQLTypes } from './dist/generators/typescript.js';
import { parseOpenAPISchema } from './dist/parsers/openapi.js';
import { normalizeOpenAPISchema } from './dist/normalizers/openapi.js';
import { loadOpenAPISchema } from './dist/loaders/openapi.js';
import { loadGraphQLSchema } from './dist/loaders/graphql.js';
import { normalizeGraphQLSchema } from './dist/normalizers/graphql.js';
import fs from 'fs/promises';
import path from 'path';

const fixturesDir = './tests/fixtures';

/**
 * Example 1: Generate a fetch-based REST client from OpenAPI
 *
 * This example loads the Petstore OpenAPI schema, parses it,
 * normalizes endpoints, generates TypeScript types, and creates
 * a fetch-based HTTP client.
 */
async function example1_FetchClient() {
  console.log('\n📘 Example 1: Fetch-based REST Client\n');
  
  try {
    // Load the Petstore OpenAPI spec (YAML)
    const spec = await loadOpenAPISchema(path.join(fixturesDir, 'petstore.yaml'));
    
    // Parse and validate the schema
    const parsed = await parseOpenAPISchema(spec);
    
    // Normalize to uniform endpoint format
    const endpoints = normalizeOpenAPISchema(parsed);
    
    console.log(`✓ Loaded ${endpoints.length} API endpoints from Petstore`);
    
    // Generate TypeScript types
    const types = await generateTypes(endpoints, {
      outputPath: './examples/petstore-types.ts',
      zod: false,
    });
    console.log('✓ Generated TypeScript types');
    
    // Generate fetch client
    const client = await generateClient(endpoints, {
      outputPath: './examples/petstore-client-fetch.ts',
      httpLibrary: 'fetch',
      baseUrl: 'https://petstore.swagger.io/v2',
    });
    console.log('✓ Generated fetch client');
    console.log(`\nClient preview (first 300 chars):\n${client.substring(0, 300)}...\n`);
    
  } catch (err) {
    console.error('❌ Example 1 failed:', err.message);
  }
}

/**
 * Example 2: Generate an axios client with Zod validation
 *
 * Uses Zod for runtime schema validation. The generated client
 * includes both TypeScript types and Zod validators.
 */
async function example2_AxiosWithZod() {
  console.log('\n📘 Example 2: Axios Client with Zod Validation\n');
  
  try {
    const spec = await loadOpenAPISchema(path.join(fixturesDir, 'petstore.json'));
    const parsed = await parseOpenAPISchema(spec);
    const endpoints = normalizeOpenAPISchema(parsed);
    
    // Generate types with Zod validators
    const types = await generateTypes(endpoints, {
      outputPath: './examples/petstore-types-zod.ts',
      zod: true,
      prefix: 'Pet',
    });
    console.log('✓ Generated TypeScript types with Zod schemas');
    
    // Generate axios client
    const client = await generateClient(endpoints, {
      outputPath: './examples/petstore-client-axios.ts',
      httpLibrary: 'axios',
      baseUrl: 'https://petstore.swagger.io/v2',
      zod: true,
    });
    console.log('✓ Generated axios client with Zod validation\n');
    
  } catch (err) {
    console.error('❌ Example 2 failed:', err.message);
  }
}

/**
 * Example 3: Generate RTK Query hooks
 *
 * RTK Query is Redux Toolkit's data fetching & caching library.
 * Perfect for React apps with Redux.
 */
async function example3_RTKQuery() {
  console.log('\n📘 Example 3: RTK Query Hooks\n');
  
  try {
    const spec = await loadOpenAPISchema(path.join(fixturesDir, 'petstore.yaml'));
    const parsed = await parseOpenAPISchema(spec);
    const endpoints = normalizeOpenAPISchema(parsed);
    
    const client = await generateClient(endpoints, {
      outputPath: './examples/petstore-client-rtk.ts',
      httpLibrary: 'rtk',
      baseUrl: 'https://petstore.swagger.io/v2',
    });
    console.log('✓ Generated RTK Query API slice');
    console.log(`\nRTK client preview (first 300 chars):\n${client.substring(0, 300)}...\n`);
    
  } catch (err) {
    console.error('❌ Example 3 failed:', err.message);
  }
}

/**
 * Example 4: Generate TanStack Query (React Query) hooks
 *
 * TanStack Query (aka React Query) is a powerful data sync library
 * for React. Perfect for modern React applications.
 */
async function example4_TanStackQuery() {
  console.log('\n📘 Example 4: TanStack Query Hooks\n');
  
  try {
    const spec = await loadOpenAPISchema(path.join(fixturesDir, 'petstore.json'));
    const parsed = await parseOpenAPISchema(spec);
    const endpoints = normalizeOpenAPISchema(parsed);
    
    const client = await generateClient(endpoints, {
      outputPath: './examples/petstore-client-tanstack.ts',
      httpLibrary: 'tanstack',
      baseUrl: 'https://petstore.swagger.io/v2',
    });
    console.log('✓ Generated TanStack Query hooks\n');
    
  } catch (err) {
    console.error('❌ Example 4 failed:', err.message);
  }
}

/**
 * Example 5: Generate a GraphQL client
 *
 * Generates a typed GraphQL client with support for queries,
 * mutations, and subscriptions. Includes WebSocket support.
 */
async function example5_GraphQLClient() {
  console.log('\n📘 Example 5: GraphQL Client\n');
  
  try {
    // Load GraphQL schema
    const schema = await loadGraphQLSchema(path.join(fixturesDir, 'petstore.graphql'));
    
    // Normalize to endpoints
    const endpoints = normalizeGraphQLSchema(schema);
    
    console.log(`✓ Loaded ${endpoints.length} GraphQL operations`);
    
    // Generate GraphQL types
    const types = await generateGraphQLTypes(endpoints, {
      outputPath: './examples/petstore-graphql-types.ts',
      zod: true,
      prefix: 'GQL',
    });
    console.log('✓ Generated GraphQL types');
    
    // Generate GraphQL client
    const client = await generateGraphQLClient(endpoints, {
      outputPath: './examples/petstore-graphql-client.ts',
      baseUrl: 'https://api.example.com/graphql',
      wsUrl: 'wss://api.example.com/graphql',
      zod: true,
    });
    console.log('✓ Generated GraphQL client with subscription support\n');
    
  } catch (err) {
    console.error('❌ Example 5 failed:', err.message);
  }
}

/**
 * Example 6: Programmatic API - Full workflow
 *
 * Demonstrates the complete pipeline: load → parse → normalize → generate
 * for both REST and GraphQL.
 */
async function example6_ProgrammaticAPI() {
  console.log('\n📘 Example 6: Complete Programmatic Workflow\n');
  
  try {
    // REST workflow
    console.log('REST API:');
    const restSpec = await loadOpenAPISchema(path.join(fixturesDir, 'petstore.json'));
    const restParsed = await parseOpenAPISchema(restSpec);
    const restEndpoints = normalizeOpenAPISchema(restParsed);
    console.log(`  - Loaded and processed ${restEndpoints.length} endpoints`);
    
    // GraphQL workflow
    console.log('GraphQL API:');
    const gqlSchema = await loadGraphQLSchema(path.join(fixturesDir, 'petstore.graphql'));
    const gqlEndpoints = normalizeGraphQLSchema(gqlSchema);
    console.log(`  - Loaded and processed ${gqlEndpoints.length} operations\n`);
    
  } catch (err) {
    console.error('❌ Example 6 failed:', err.message);
  }
}

/**
 * Main: Run all examples
 */
async function main() {
  console.log('═════════════════════════════════════════════════════');
  console.log('  @23rdpro/xapi - Usage Examples');
  console.log('  Type-Safe API Client Generator');
  console.log('═════════════════════════════════════════════════════');
  
  // Ensure output directory exists
  await fs.mkdir('./examples', { recursive: true }).catch(() => {});
  
  // Run examples
  await example1_FetchClient();
  await example2_AxiosWithZod();
  await example3_RTKQuery();
  await example4_TanStackQuery();
  await example5_GraphQLClient();
  await example6_ProgrammaticAPI();
  
  console.log('═════════════════════════════════════════════════════');
  console.log('✅ All examples completed!');
  console.log('\n📁 Generated files saved to ./examples/');
  console.log('\n📖 For more info, see README.md\n');
}

main().catch(console.error);
