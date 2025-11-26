import { describe, it, expect } from "vitest";
import { isUrl, getExtension } from "../../src/utils/file";

describe("utils/file", () => {
  it("detects http(s) URLs", () => {
    expect(isUrl("https://example.com/schema.json")).toBe(true);
    expect(isUrl("http://example.com/foo.yaml")).toBe(true);
  });

  it("does not treat windows or local paths as urls", () => {
    expect(isUrl("C:\\Users\\me\\schema.yaml")).toBe(false);
    expect(isUrl("/home/me/schema.yaml")).toBe(false);
  });

  it("gets extension for urls and local files", () => {
    expect(getExtension("https://example.com/schema.json")).toBe(".json");
    expect(getExtension("/home/me/schema.yaml")).toBe(".yaml");
    expect(getExtension("C:\\foo\\bar.yml")).toBe(".yml");
  });
});
