xAPI Copilot Instructions
Project Overview

xAPI is a TypeScript SDK for generating type-safe API clients from OpenAPI and GraphQL schemas.
It uses a plugin-based architecture that produces strongly-typed clients for:

REST APIs → fetch, axios, RTK Query, TanStack Query

GraphQL APIs → Operations-based clients

Architecture
Core Flow: Plugin System
CLI / Script
↓
Plugin Registry
↓
Schema Detection
↓
Plugin.run()
├─ REST Plugin (YAML/JSON)
└─ GraphQL Plugin (.graphql)

Key Files

src/core/pluginSystem.ts — Registers plugins, matches schema type by extension

src/plugins/{rest,graphql,generate}.ts — Plugin execution logic

src/cli.ts — Command parsing (generate, init, doctor)

Pipeline for Each Schema Type
REST / OpenAPI Path

Load — loaders/openapi.ts

Parse — parsers/openapi.ts using @apidevtools/swagger-parser

Normalize — normalizers/openapi.ts → produces uniform Endpoint[]

Generate — generators/{typescript,client}.ts

GraphQL Path

Load — loaders/graphql.ts

Parse — parsers/graphql.ts builds GraphQL schema

Normalize — normalizers/graphql.ts → GraphQLEndpoint[]

Generate — Same generators as REST

HTTP Client Variants

The generator switches logic based on the CLI/config:

fetch (default)

axios

rtk (RTK Query)

tanstack (React Query)

See: src/generators/client.ts

Critical Data Types
REST Endpoint
{
id: string;
name: string;
method: HttpMethod; // get | post | put | patch | delete ...
path: string; // "/pets/{id}"
params: Param[];
requestBody?: Body;
responses: Response[];
}

GraphQLEndpoint
{
operationType: "query" | "mutation" | "subscription";
operationName: string;
requestSchema?: any;
responseSchema?: any;
graphql: { kind, field };
}

Configuration & Entry Points
Optional Config File

xapi.config.json

{
"schema": "./openapi.yaml",
"outDir": "src/generated",
"baseUrl": "https://api.example.com",
"httpLibrary": "fetch",
"zod": true
}

CLI Commands
Command Description
xapi generate [schema] [client] Main codegen
xapi init Create config
xapi doctor [schema] Validate schema
Development Scripts

pnpm xapi:generate

pnpm dev:cli

pnpm test

pnpm build

Testing Strategy

Framework → Vitest
Path Aliases → vite-tsconfig-paths

Layout

/tests/\*_/_ mirrors /src

/tests/fixtures/\* contains Petstore YAML/JSON/GraphQL

Important Tests

client.test.ts — verifies client variants

typescript.test.ts — type & Zod generation

openapi.test.ts — dereferencing

openapi.normalizer.test.ts — endpoint mapping correctness

Common Patterns

1. Options Threading
   interface ClientGenOptions {
   outputPath?: string;
   httpLibrary?: "fetch" | "axios" | "rtk" | "tanstack";
   baseUrl?: string;
   zod?: boolean;
   wsUrl?: string;
   prefix?: string;
   }

2. Naming Conventions

Functions → camelCase (getPet)

Types → PascalCase (GetPetParams)

Zod schemas → {TypeName}Schema and {TypeName}Parsed

3. Schema Handling

Use stableStringify() for hashing

Use jsonSchemaToTS() when needed

simpleSchemaToTS() for primitives

4. Error Handling

MissingDependencyError for missing axios/rtk/tanstack

chalk for CLI colors

ora spinner wrapper via withSpinner()

Development Workflow

Run tests first → pnpm test

Update generator logic (REST/GraphQL)

Add fixtures if needed

Ensure type safety with aliases

Build + run CLI manually
pnpm build
pnpm dev:cli -- ./schema.yaml fetch

Import Path Aliases

Use aliases, not relative paths:

// Correct
import { normalize } from "normalizers/openapi";

// Incorrect
import { normalize } from "../normalizers/openapi";

Key Dependencies

@apidevtools/swagger-parser

graphql

zod (optional)

commander

chalk

ora

vitest
