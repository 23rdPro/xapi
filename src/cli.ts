import { ClientGenOptions } from "types/generators";
import { registerPlugin, runPlugins } from "core/pluginSystem";
import chalk from "chalk";
import { Command } from "commander";
import { restPlugin } from "plugins/rest";
import { graphqlPlugin } from "plugins/graphql";
import { generatePlugin } from "plugins/generate";
import { withSpinner } from "utils/spinner";

const program = new Command();

program
  .name("xapi")
  .description("⚡ Type-safe API client generator (OpenAPI + GraphQL)")
  .version("1.0.0");

// -------------------------------
// xapi generate
// -------------------------------
program
  .command("generate")
  .argument("[schemaPath]", "Optional path or URL to OpenAPI or GraphQL schema")
  .option(
    "-c, --client <client>",
    "HTTP library to use (fetch, axios, rtk, tanstack)",
    "fetch"
  )
  .option("-o, --out <dir>", "Output directory", "src/generated")
  .option("--zod", "Include Zod validators", false)
  .option("--base-url <url>", "API base URL", "https://api.example.com")
  .action(async (schemaPath, options) => {
    const httpLib =
      (options.client as ClientGenOptions["httpLibrary"]) ?? "fetch";

    // Auto-load config
    const fs = (await import("fs/promises")).default;
    const fsSync = (await import("fs")).default;
    if (!schemaPath) {
      try {
        const configRaw = await fs.readFile("xapi.config.json", "utf8");
        const config = JSON.parse(configRaw);
        console.log(chalk.gray(`🧩 Using config from xapi.config.json`));
        schemaPath = config.schema;
        options.out = config.outDir ?? options.out;
        options.baseUrl = config.baseUrl ?? options.baseUrl;
        options.client = config.httpLibrary ?? options.client;
        options.zod = config.zod ?? options.zod;
        options.prefix = config.prefix ?? undefined;
        options.wsUrl = config.wsUrl ?? undefined;
      } catch {
        console.log(
          chalk.yellow(
            `⚠ No schema argument or xapi.config.json found. Using defaults.`
          )
        );
      }
    }

    // Default fallback if still no schemaPath
    if (!schemaPath) {
      schemaPath = "./tests/fixtures/petstore.yaml";
      console.log(
        chalk.yellow(
          `⚠ No schema provided — defaulting to Petstore example at ${schemaPath}`
        )
      );
    }

    // If schemaPath is a file but doesn't exist → fallback
    if (!/^https?:\/\//.test(schemaPath) && !fsSync.existsSync(schemaPath)) {
      console.log(
        chalk.yellow(
          `⚠ Schema file not found at ${schemaPath}\n→ Falling back to Petstore example.`
        )
      );
      schemaPath = "./tests/fixtures/petstore.yaml";
    }

    const { ensureHttpLibInstalled } = await import("../scripts/generate");
    try {
      ensureHttpLibInstalled(httpLib);
    } catch (err) {
      console.error(chalk.red((err as Error).message));
      process.exit(1);
    }

    registerPlugin(generatePlugin);
    registerPlugin(restPlugin);
    registerPlugin(graphqlPlugin);

    try {
      await withSpinner(
        `Generating ${httpLib} client for ${schemaPath}...`,
        async () => {
          await runPlugins(schemaPath, {
            outDir: options.out,
            baseUrl: options.baseUrl,
            httpLibrary: httpLib,
            zod: Boolean(options.zod),
            prefix: options.prefix,
            wsUrl: options.wsUrl,
          });
        }
      );
      console.log(chalk.green(`✅ Codegen complete! Output → ${options.out}`));
    } catch (err) {
      console.error(chalk.red("❌ Codegen failed:"), err);
      process.exit(1);
    }
  });

// -------------------------------
// xapi init
// -------------------------------
program
  .command("init")
  .description("Initialize an xapi.config.json file")
  .action(async () => {
    const fs = (await import("fs/promises")).default;

    const fsSync = (await import("fs")).default;

    if (fsSync.existsSync("xapi.config.json")) {
      console.log(
        chalk.yellow("⚠ xapi.config.json already exists — skipping.")
      );
      return;
    }

    await withSpinner("Creating xapi.config.json...", async () => {
      const config = {
        schema: "./openapi.yaml",
        outDir: "src/generated",
        baseUrl: "https://api.example.com",
        httpLibrary: "fetch",
        zod: true,
      };

      await fs.writeFile(
        "xapi.config.json",
        JSON.stringify(config, null, 2),
        "utf8"
      );
    });

    console.log(chalk.green("✅ Created xapi.config.json"));
  });

// -------------------------------
// xapi doctor
// -------------------------------
program
  .command("doctor")
  .description("Validate schema and config")
  .argument("[schemaPath]", "Optional schema path to validate")
  .action(async (schemaPath) => {
    console.log(chalk.cyan("🩺 Running xapi doctor..."));

    if (!schemaPath) {
      console.log(chalk.yellow("No schema provided — nothing to check."));
      return;
    }

    const { loadOpenAPISchema } = await import("loaders/openapi");

    try {
      await withSpinner(`Validating ${schemaPath}...`, async () => {
        await loadOpenAPISchema(schemaPath);
      });
      console.log(chalk.green(`✅ Schema ${schemaPath} looks good!`));
    } catch (err) {
      console.error(chalk.red("❌ Invalid schema:"), err);
      process.exit(1);
    }
  });

// Run
program.parseAsync(process.argv);
