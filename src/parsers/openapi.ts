/* 
Validate & parse OpenAPI schema into a JS object.

Take whatever the loader returned (an OpenAPI object) and:
Validate the spec (report useful errors).
Dereference / bundle $refs so downstream codegen has a flattened model.
Return a normalized OpenAPI object suitable for a normalizer.

*/
import SwaggerParser from "@apidevtools/swagger-parser";
import YAML from "yaml";
/**
 * Parse input that may be:
 * an already-parsed object
 * a file path or URL string (SwaggerParser)
 * parse raw JSON/YAML string
 */
export async function parseOpenAPISchema(input: any): Promise<any> {
  let schemaToDereference = input;

  if (typeof input === "string") {
    if (/^\s*(?:\.\/|\/|[A-Za-z]:\\|https?:\/\/)/.test(input)) {
      schemaToDereference = input; // path or url
    } else {
      try {
        schemaToDereference = JSON.parse(input);
      } catch (jsonErr: any) {
        try {
          schemaToDereference = YAML.parse(input);
        } catch (yamlErr: any) {
          throw new Error(
            `Input string is not valid JSON or YAML, and not an obvious path/URL.\nJSON error: ${jsonErr.message}\nYAML error: ${yamlErr.message}`
          );
        }
      }
    }
  }
  try {
    // SwaggerParser accepts object or file path/URL
    const deref = await SwaggerParser.dereference(schemaToDereference as any);
    await SwaggerParser.validate(deref as any);
    return deref;
  } catch (err: any) {
    throw new Error(
      `OpenAPI parse/validate failed: ${err?.message || String(err)}\n\nOriginal stack:\n${err?.stack || ""}`
    );
  }
}
export default parseOpenAPISchema;
