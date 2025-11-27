# xAPI — Type-Safe API Client Generator

> Generate strongly-typed REST and GraphQL API clients from OpenAPI and GraphQL schemas.

## 📋 Project Overview

**xAPI** is a TypeScript SDK for generating type-safe API clients from OpenAPI and GraphQL schemas. It uses a **plugin-based architecture** that produces strongly-typed clients for:

- **REST APIs** → `fetch`, `axios`, `RTK Query`, `TanStack Query`
- **GraphQL APIs** → Operations-based clients with subscription support

## 📖 Quick Start

### Installation

```bash
npm install @23rdpro/xapi
# or
pnpm add @23rdpro/xapi
```

### Basic Usage (CLI)

Generate a fetch client from an OpenAPI spec:

```bash
xapi generate ./openapi.yaml fetch --zod --out src/generated
```

Create a config file:

```bash
xapi init
xapi generate
```

### Usage Examples

#### Programmatic Examples

See **[`examples.js`](./examples.js)** for comprehensive examples demonstrating:

- ✅ Generating fetch, axios, RTK, and TanStack clients
- ✅ Working with GraphQL schemas and subscriptions
- ✅ Using Zod validators for runtime validation
- ✅ Programmatic API for integration
- ✅ Custom naming prefixes

**Run programmatic examples:**

```bash
node examples.js
```

This generates sample clients from the included Petstore fixtures.

#### CLI Examples

See **[`cli-examples.js`](./cli-examples.js)** for real-world CLI command examples demonstrating:

- ✅ Installation via npm/pnpm
- ✅ Generating clients for different HTTP libraries
- ✅ Configuration file setup
- ✅ Common workflows and patterns
- ✅ CI/CD integration
- ✅ Using generated clients in applications

**Run CLI examples:**

```bash
node cli-examples.js
```

This will execute actual `xapi generate` commands and show you the workflows.

## 🏗️ Architecture

### Core Flow: Plugin System

```
CLI / Script
    ↓
Plugin Registry
    ↓
Schema Detection
    ↓
Plugin.run()
├─ REST Plugin (YAML/JSON)
└─ GraphQL Plugin (.graphql)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/core/pluginSystem.ts` | Registers plugins, matches schema type by extension |
| `src/plugins/{rest,graphql,generate}.ts` | Plugin execution logic |
| `src/cli.ts` | Command parsing (generate, init, doctor) |

### Pipeline for Each Schema Type

#### REST / OpenAPI Path

1. **Load** → `loaders/openapi.ts` — Fetch from file or URL
2. **Parse** → `parsers/openapi.ts` using `@apidevtools/swagger-parser`
3. **Normalize** → `normalizers/openapi.ts` → produces uniform `Endpoint[]`
4. **Generate** → `generators/{typescript,client}.ts`

#### GraphQL Path

1. **Load** → `loaders/graphql.ts` — Support `.graphql` SDL or `.json` introspection
2. **Parse** → `parsers/graphql.ts` builds GraphQL schema
3. **Normalize** → `normalizers/graphql.ts` → `GraphQLEndpoint[]`
4. **Generate** → Same generators as REST (polymorphic)

### HTTP Client Variants

The generator switches logic based on the CLI/config:

```typescript
// Supported clients
type HttpLibrary = "fetch" | "axios" | "rtk" | "tanstack";
```

- **`fetch`** (default) — Native browser/Node API
- **`axios`** — Popular HTTP client
- **`rtk`** — Redux Toolkit Query
- **`tanstack`** — React Query

See: `src/generators/client.ts`

## 📦 Critical Data Types

### REST Endpoint

```typescript
type Endpoint = {
  id: string;
  name: string;
  method: HttpMethod; // "get" | "post" | "put" | "patch" | "delete" ...
  path: string; // e.g., "/pets/{id}"
  params: Param[];
  requestBody?: Body;
  responses: Response[];
};
```

### GraphQL Endpoint

```typescript
type GraphQLEndpoint = {
  operationType: "query" | "mutation" | "subscription";
  operationName: string;
  requestSchema?: any;
  responseSchema?: any;
  graphql: { kind, field };
};
```

## ⚙️ Configuration & Entry Points

### Optional Config File: `xapi.config.json`

```json
{
  "schema": "./openapi.yaml",
  "outDir": "src/generated",
  "baseUrl": "https://api.example.com",
  "httpLibrary": "fetch",
  "zod": true
}
```

### CLI Commands

| Command | Description |
|---------|-------------|
| `xapi generate [schema] [client]` | Main codegen (supports `--zod`, `--base-url`, `--out`) |
| `xapi init` | Create config file interactively |
| `xapi doctor [schema]` | Validate schema and configuration |

### Development Scripts

```bash
pnpm xapi:generate       # Run code generation
pnpm dev:cli             # Test CLI locally with tsx
pnpm test                # Run tests (Vitest)
pnpm lint                # ESLint check
pnpm build               # Build for distribution
```

## 🧪 Testing Strategy

### Framework & Setup

- **Test Runner** → `Vitest`
- **Path Resolution** → `vite-tsconfig-paths` (uses `tsconfig.json` aliases)

### Test Layout

```
tests/
├── generators/
│   ├── client.test.ts       ← REST & GraphQL client generation
│   └── typescript.test.ts   ← Type & Zod schema generation
├── parsers/
│   └── openapi.test.ts      ← Schema dereferencing
├── normalizers/
│   └── openapi.test.ts      ← Endpoint normalization
├── loaders/
│   └── openapi.test.ts      ← File/URL loading
├── fixtures/
│   ├── petstore.yaml        ← Sample OpenAPI spec
│   ├── petstore.json        ← Sample OpenAPI (JSON)
│   └── petstore.graphql     ← Sample GraphQL schema
└── utils/
    └── file.test.ts         ← Utility functions
```

### Important Test Files

- **`client.test.ts`** — Verifies fetch, axios, RTK, TanStack variant output
- **`typescript.test.ts`** — Type & Zod schema generation
- **`openapi.test.ts`** — Schema dereferencing & validation
- **`openapi.normalizer.test.ts`** — Endpoint mapping correctness

## 🎯 Common Patterns

### 1. Options Threading

Options flow through the pipeline via a single `ClientGenOptions` interface:

```typescript
interface ClientGenOptions {
  outputPath?: string;
  httpLibrary?: "fetch" | "axios" | "rtk" | "tanstack";
  baseUrl?: string;
  zod?: boolean;
  wsUrl?: string;           // GraphQL subscriptions
  prefix?: string;          // Type name prefix
}
```

### 2. Naming Conventions

- **Functions** → `camelCase` (e.g., `getPet`, `updateUser`)
- **Types** → `PascalCase` + suffix (e.g., `GetPetParams`, `GetPetResponse`)
- **Zod schemas** → `${TypeName}Schema` with inferred type: `${TypeName}Parsed`

### 3. Schema Handling

- Use `stableStringify()` for schema deduplication via content hashing
- Use `jsonSchemaToTS()` for complex JSON schemas
- Fall back to `simpleSchemaToTS()` for simple types

### 4. Error Handling

```typescript
// Missing dependency
throw new MissingDependencyError("axios", "@reduxjs/toolkit");

// CLI feedback
console.log(chalk.green("✅ Success"));

// Async operations with spinner
await withSpinner("Generating types...", async () => {
  // work here
});
```

## 🔧 Development Workflow

1. **Run tests first** to establish baseline
   ```bash
   pnpm test
   ```

2. **Update generator logic** (handle both REST and GraphQL paths if needed)
   - Edit `src/generators/` or `src/plugins/`

3. **Add test fixtures** if testing new schema patterns
   - Place in `tests/fixtures/`

4. **Ensure type safety** — use import aliases, not relative paths

5. **Build & test CLI manually**
   ```bash
   pnpm build
   pnpm dev:cli -- ./tests/fixtures/petstore.yaml fetch
   ```

## 📍 Import Path Aliases

**Always use import aliases**, configured in `tsconfig.json`:

✅ **Correct:**
```typescript
import { normalize } from "normalizers/openapi";
import { Endpoint } from "types/endpoint";
import { withSpinner } from "utils/spinner";
```

❌ **Avoid:**
```typescript
import { normalize } from "../normalizers/openapi";
import { Endpoint } from "../../types/endpoint";
```

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `@apidevtools/swagger-parser` | OpenAPI validation & dereferencing |
| `graphql` | GraphQL schema parsing & introspection |
| `zod` | Runtime validation schemas (optional) |
| `commander` | CLI argument parsing |
| `chalk` | Terminal colors |
| `ora` | CLI spinners |
| `vitest` | Test runner |

---

> **Last Updated:** November 26, 2025  
> **Maintained by:** xAPI Team
