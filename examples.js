#!/usr/bin/env node

/**
 * xAPI Usage Examples
 *
 * This file demonstrates how to use @23rdpro/xapi via the CLI to generate
 * type-safe API clients from OpenAPI and GraphQL schemas.
 *
 * Note: This file is included in the npm package as a reference.
 * It shows the primary way to use xAPI: through the command-line interface.
 *
 * Install the package first:
 *   npm install @23rdpro/xapi
 *
 * Then run this file to see the examples:
 *   node examples.js
 *
 * Examples include:
 * - Generating REST clients (fetch, axios, RTK, TanStack)
 * - Generating GraphQL clients with subscriptions
 * - Using Zod validators for runtime validation
 * - Integration with your project
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper to run shell commands
function runCommand(command, args = [], description = '') {
  return new Promise((resolve, reject) => {
    console.log(`\n${'─'.repeat(70)}`);
    if (description) console.log(`📌 ${description}`);
    console.log(`$ ${command} ${args.join(' ')}`);
    console.log('─'.repeat(70));

    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname,
    });

    proc.on('close', (code) => {
      if (code !== 0 && code !== 1) {
        console.log(`\n⚠️  Command exited with code ${code}`);
      }
      resolve(code);
    });

    proc.on('error', (err) => {
      console.error(`❌ Failed to run: ${err.message}`);
      reject(err);
    });
  });
}

async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║                 @23rdpro/xapi - Usage Examples                        ║');
  console.log('║                                                                       ║');
  console.log('║              Type-Safe API Client Generator for TypeScript            ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝');
  console.log();

  // Example 1: Fetch client from OpenAPI YAML
  await runCommand(
    'npx',
    ['@23rdpro/xapi', 'generate', './tests/fixtures/petstore.yaml', 'fetch', '--out', 'src/generated-example-1'],
    'Example 1: Generate fetch client from OpenAPI (YAML)'
  );

  // Example 2: Axios client with Zod validation
  await runCommand(
    'npx',
    ['@23rdpro/xapi', 'generate', './tests/fixtures/petstore.json', 'axios', '--zod', '--out', 'src/generated-example-2'],
    'Example 2: Generate axios client with Zod validators (JSON)'
  );

  // Example 3: RTK Query hooks
  await runCommand(
    'npx',
    ['@23rdpro/xapi', 'generate', './tests/fixtures/petstore.yaml', 'rtk', '--out', 'src/generated-example-3'],
    'Example 3: Generate RTK Query hooks (for React + Redux)'
  );

  // Example 4: TanStack Query hooks
  await runCommand(
    'npx',
    ['@23rdpro/xapi', 'generate', './tests/fixtures/petstore.yaml', 'tanstack', '--out', 'src/generated-example-4'],
    'Example 4: Generate TanStack Query hooks (for modern React)'
  );

  // Example 5: GraphQL client
  await runCommand(
    'npx',
    ['@23rdpro/xapi', 'generate', './tests/fixtures/petstore.graphql', 'fetch', '--out', 'src/generated-example-5'],
    'Example 5: Generate GraphQL client with subscription support'
  );

  // Example 6: Using configuration file
  console.log('\n' + '='.repeat(70));
  console.log('📌 Example 6: Using a configuration file');
  console.log('='.repeat(70));
  console.log(`
Instead of passing all options on the CLI, you can create an xapi.config.json:

{
  "schema": "./specs/openapi.yaml",
  "httpLibrary": "fetch",
  "outDir": "src/generated",
  "baseUrl": "https://api.example.com",
  "zod": true,
  "prefix": "API"
}

Then simply run:
$ npx @23rdpro/xapi generate

xAPI will automatically use the configuration.
  `);

  // Example 7: Real-world usage
  console.log('\n' + '='.repeat(70));
  console.log('📌 Example 7: Using generated client in your code');
  console.log('='.repeat(70));
  console.log(`
After generating with: xapi generate ./openapi.yaml fetch --out src/api

In your TypeScript/JavaScript:

import { createClient } from './src/api'
import type { Pet, PetStatus } from './src/api/types'

async function main() {
  const client = createClient({
    baseUrl: 'https://petstore.api.com',
  })

  // List all pets
  const pets = await client.listPets({ limit: 10 })
  console.log('Pets:', pets)

  // Create a new pet
  const newPet = await client.createPet({
    name: 'Fluffy',
    status: 'available',
  })

  // Get pet by ID
  const pet = await client.getPet({ petId: newPet.id })
  
  // Update pet
  await client.updatePet({
    petId: pet.id,
    name: 'Updated Fluffy',
    status: 'sold',
  })
}

main().catch(console.error)
  `);

  // Show output structure
  console.log('\n' + '='.repeat(70));
  console.log('📋 Generated Files Structure');
  console.log('='.repeat(70));
  console.log(`
Each generation creates:

src/generated/
├── index.ts              # Main export
├── types.ts              # All TypeScript types
├── client.ts             # HTTP client
├── validators.ts         # Zod schemas (if --zod used)
└── endpoints.ts          # Endpoint definitions

Key exports from index.ts:
  - createClient()        - Initialize HTTP client
  - getEndpoints()        - Get endpoint metadata
  - createValidator()     - Runtime type validation
  `);

  // Clean up examples
  console.log('\n🧹 Cleaning up example outputs...\n');
  const exampleDirs = [
    'src/generated-example-1',
    'src/generated-example-2',
    'src/generated-example-3',
    'src/generated-example-4',
    'src/generated-example-5',
  ];

  for (const dir of exampleDirs) {
    const fullPath = path.join(__dirname, dir);
    try {
      await fs.rm(fullPath, { recursive: true, force: true });
      console.log(`✓ Removed ${dir}`);
    } catch (_err) {
      // Ignore cleanup errors
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('✅ Examples Complete!');
  console.log('='.repeat(70));
  console.log(`
📚 Learn more:
  • README.md - Full documentation
  • cli-examples.js - More CLI command examples
  • GitHub - https://github.com/23rdPro/xapi

🚀 Next steps:
  1. Create your xapi.config.json
  2. Run: npx @23rdpro/xapi generate
  3. Import generated client in your code
  4. Enjoy type safety!
  `);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
