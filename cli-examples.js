#!/usr/bin/env node

/**
 * CLI Usage Examples for xAPI
 * 
 * This file demonstrates how to install and use xAPI via the command line.
 * These are real, executable examples using actual CLI commands.
 * 
 * Prerequisites:
 * 1. Node.js 18+ installed
 * 2. npm or pnpm installed
 * 
 * Installation & Setup:
 * npm install @23rdpro/xapi
 * # or
 * pnpm add @23rdpro/xapi
 * 
 * Then you can run xapi commands globally or with npx:
 * npx xapi generate ./openapi.yaml fetch
 * 
 * Run this file to see command examples:
 * node cli-examples.js
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper to run shell commands and capture output
function runCommand(command, args = [], description = '') {
  return new Promise((resolve, reject) => {
    console.log('\n' + '='.repeat(70));
    console.log(`📌 ${description || command}`);
    console.log('='.repeat(70));
    console.log(`$ ${command} ${args.join(' ')}\n`);

    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        console.log(`\n⚠️  Command exited with code ${code}`);
      }
      resolve(code);
    });

    proc.on('error', (err) => {
      console.error(`❌ Failed to run command: ${err.message}`);
      reject(err);
    });
  });
}

async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║              xAPI CLI Usage Examples                                  ║');
  console.log('║                                                                       ║');
  console.log('║  This demonstrates real-world xAPI CLI commands.                     ║');
  console.log('║  Some commands require the package to be installed via npm/pnpm.      ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  console.log('📦 INSTALLATION & SETUP');
  console.log('─'.repeat(70));
  console.log(`
The xAPI package is distributed as @23rdpro/xapi on npm:

# Install as a dev dependency
npm install --save-dev @23rdpro/xapi
pnpm add -D @23rdpro/xapi

# Install globally (so xapi command is available everywhere)
npm install -g @23rdpro/xapi

# Or use npx to run without installing
npx @23rdpro/xapi generate ./openapi.yaml fetch
  `);

  console.log('\n✨ EXAMPLE COMMANDS');
  console.log('─'.repeat(70));

  // Example 1: Show version
  await runCommand('xapi', ['version'], 'Example 1: Check xAPI version');

  // Example 2: Generate fetch client from OpenAPI YAML
  await runCommand(
    'xapi',
    ['generate', './tests/fixtures/petstore.yaml', 'fetch', '--out', 'src/generated-cli-1'],
    'Example 2: Generate fetch client from OpenAPI YAML'
  );

  // Example 3: Generate axios client with Zod validators
  await runCommand(
    'xapi',
    ['generate', './tests/fixtures/petstore.json', 'axios', '--zod', '--out', 'src/generated-cli-2'],
    'Example 3: Generate axios client with Zod validators'
  );

  // Example 4: Generate RTK Query hooks
  await runCommand(
    'xapi',
    ['generate', './tests/fixtures/petstore.yaml', 'rtk', '--base-url', 'https://petstore.api.com', '--out', 'src/generated-cli-3'],
    'Example 4: Generate RTK Query hooks with custom base URL'
  );

  // Example 5: Generate TanStack Query hooks
  await runCommand(
    'xapi',
    ['generate', './tests/fixtures/petstore.yaml', 'tanstack', '--out', 'src/generated-cli-4'],
    'Example 5: Generate TanStack Query hooks'
  );

  // Example 6: Generate GraphQL client
  await runCommand(
    'xapi',
    ['generate', './tests/fixtures/petstore.graphql', 'fetch', '--out', 'src/generated-cli-5'],
    'Example 6: Generate GraphQL client (auto-detects schema type)'
  );

  // Example 7: Show what happens when no schema is provided (uses default)
  // Note: This requires xapi.config.json to be in place, which it is
  const configPath = path.join(__dirname, 'xapi.config.json');
  if (fs.existsSync(configPath)) {
    await runCommand(
      'xapi',
      ['generate'],
      'Example 7: Generate with no arguments (uses xapi.config.json or defaults to Petstore)'
    );
  } else {
    console.log('\n' + '='.repeat(70));
    console.log('📌 Example 7: xapi.config.json found - skipping (requires config file)');
    console.log('='.repeat(70));
  }

  console.log('\n' + '='.repeat(70));
  console.log('📋 CONFIGURATION FILE EXAMPLE');
  console.log('='.repeat(70));

  const configExample = {
    schema: './specs/openapi.yaml',
    httpLibrary: 'fetch',
    outDir: 'src/generated',
    baseUrl: 'https://api.example.com',
    zod: true,
    prefix: 'API',
    wsUrl: 'wss://api.example.com/graphql',
  };

  console.log('\nCreate xapi.config.json in your project root:\n');
  console.log(JSON.stringify(configExample, null, 2));
  console.log(`
Then simply run:
$ xapi generate

xAPI will use the configuration from xapi.config.json automatically.
  `);

  console.log('\n' + '='.repeat(70));
  console.log('🎯 COMMON WORKFLOWS');
  console.log('='.repeat(70));

  const workflows = `
1️⃣  Quick OpenAPI → Fetch Client
    $ xapi generate ./api/openapi.yaml fetch --out src/api

2️⃣  OpenAPI → Axios with Validation
    $ xapi generate ./api/spec.json axios --zod --out src/api

3️⃣  React Project (RTK Query)
    $ xapi generate ./api/openapi.yaml rtk --out src/api/hooks

4️⃣  Vue/Svelte Project (TanStack Query)
    $ xapi generate ./api/openapi.yaml tanstack --out src/api/hooks

5️⃣  GraphQL API
    $ xapi generate ./schema.graphql --out src/graphql

6️⃣  Multiple Clients from Same Schema
    $ xapi generate ./api/openapi.yaml fetch --out src/api/fetch
    $ xapi generate ./api/openapi.yaml axios --out src/api/axios --zod

7️⃣  CI/CD Integration
    Run in your GitHub Actions / GitLab CI:
    - name: Generate API Client
      run: xapi generate ./specs/openapi.yaml fetch --out src/generated
    - name: Check for changes
      run: git diff --exit-code src/generated || echo "Schema changed!"
  `;

  console.log(workflows);

  console.log('\n' + '='.repeat(70));
  console.log('📚 OUTPUT STRUCTURE');
  console.log('='.repeat(70));

  const outputExample = `
After running: xapi generate ./openapi.yaml fetch --out src/generated

Generated files in src/generated/:

src/generated/
├── index.ts                    # Main client export
├── types.ts                    # All TypeScript types from schema
├── client.ts                   # HTTP client implementation
├── validators.ts               # Zod validators (if --zod used)
└── endpoints.ts                # Endpoint definitions & metadata

Typical imports in your app:
  import { createClient } from './generated'
  import type { Pet, CreatePetRequest } from './generated/types'
  import { createPetValidator } from './generated/validators'
  `;

  console.log(outputExample);

  console.log('\n' + '='.repeat(70));
  console.log('🔧 ADVANCED OPTIONS');
  console.log('='.repeat(70));

  const advancedOptions = `
--client <type>          HTTP library: fetch | axios | rtk | tanstack
--out <dir>              Output directory (default: src/generated)
--base-url <url>         API base URL for generated client
--zod                    Include Zod schema validators
--prefix <name>          Type/function name prefix (e.g., API, Custom)
--ws-url <url>           WebSocket URL for GraphQL subscriptions

Examples:
  xapi generate api.yaml fetch --base-url https://api.prod.com
  xapi generate api.yaml axios --zod --prefix MyAPI
  xapi generate schema.graphql --ws-url wss://api.example.com/graphql
  `;

  console.log(advancedOptions);

  console.log('\n' + '='.repeat(70));
  console.log('💡 USING THE GENERATED CLIENT');
  console.log('='.repeat(70));

  const usageCode = `
// Example: Using generated fetch client

import { createClient } from './generated'
import type { Pet } from './generated/types'

async function main() {
  // Initialize client
  const client = createClient({
    baseUrl: 'https://petstore.api.com',
  })

  // List pets
  const pets = await client.listPets({ limit: 10 })
  console.log('Pets:', pets)

  // Create pet
  const newPet = await client.createPet({
    name: 'Fluffy',
    status: 'available',
  })
  console.log('Created:', newPet)

  // Get pet by ID
  const pet = await client.getPetById({ petId: newPet.id })
  console.log('Retrieved:', pet)
}

main().catch(console.error)
  `;

  console.log(usageCode);

  console.log('\n' + '='.repeat(70));
  console.log('✅ SUMMARY');
  console.log('='.repeat(70));

  const summary = `
xAPI provides a single CLI command for code generation:

  xapi generate [schema] [client] [options]

Key benefits:
  ✓ Single source of truth (your API schema)
  ✓ Type-safe clients generated once, used everywhere
  ✓ Support for multiple HTTP libraries
  ✓ Optional Zod validators for runtime safety
  ✓ Works with OpenAPI 3.0+ and GraphQL schemas
  ✓ Perfect for CI/CD integration

Next steps:
  1. Install: npm install @23rdpro/xapi
  2. Create xapi.config.json in your project root
  3. Run: xapi generate
  4. Import types and client in your app
  5. Enjoy type safety! 🎉

For more info: https://github.com/23rdPro/xapi
  `;

  console.log(summary);

  // Clean up generated examples
  console.log('\n🧹 Cleaning up example outputs...\n');
  const generatedDirs = [
    'src/generated-cli-1',
    'src/generated-cli-2',
    'src/generated-cli-3',
    'src/generated-cli-4',
    'src/generated-cli-5',
  ];

  for (const dir of generatedDirs) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✓ Removed ${dir}`);
    }
  }

  console.log('\n✨ CLI examples complete!\n');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
