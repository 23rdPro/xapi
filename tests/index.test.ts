import { helloXAPI } from "../src";

console.log(helloXAPI("Dev"));

import { describe, it, expect } from "vitest";

describe("math", () => {
  it("adds numbers", () => {
    expect(1 + 1).toBe(2);
  });
});
