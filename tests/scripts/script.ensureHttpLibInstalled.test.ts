import { describe, it, expect, vi, afterEach } from "vitest";
import {
  ensureHttpLibInstalled,
  MissingDependencyError,
} from "../../scripts/generate";

describe("ensureHttpLibInstalled (sync)", () => {
  const origGlobalRequire = (globalThis as any).require;

  afterEach(() => {
    // restore original require (if any)
    (globalThis as any).require = origGlobalRequire;
    vi.restoreAllMocks();
  });

  it("returns true for 'fetch'", () => {
    expect(ensureHttpLibInstalled("fetch")).toBe(true);
  });

  it("returns true when axios package is present", () => {
    const mockResolve = vi.fn(() => "/fake/path");
    (mockResolve as any).paths = [];
    // ensure global require object exists for the test
    (globalThis as any).require = { resolve: mockResolve };
    expect(ensureHttpLibInstalled("axios")).toBe(true);
    expect((globalThis as any).require.resolve).toHaveBeenCalledWith("axios");
  });

  it("throws MissingDependencyError when @reduxjs/toolkit is missing (rtk)", () => {
    const mockResolve = vi.fn(() => {
      throw new Error("not found");
    });
    (mockResolve as any).paths = [];
    (globalThis as any).require = { resolve: mockResolve };

    expect(() => ensureHttpLibInstalled("rtk")).toThrow(MissingDependencyError);

    try {
      ensureHttpLibInstalled("rtk");
    } catch (err: any) {
      expect(err.message).toContain("rtk");
      expect(err.message).toContain("@reduxjs/toolkit");
    }
  });

  it("throws MissingDependencyError when @tanstack/react-query is missing (tanstack)", () => {
    const mockResolve = vi.fn(() => {
      throw new Error("not found");
    });
    (mockResolve as any).paths = [];
    (globalThis as any).require = { resolve: mockResolve };

    expect(() => ensureHttpLibInstalled("tanstack")).toThrow(
      MissingDependencyError
    );
  });
});

// describe("ensureHttpLibInstalled", () => {
//   const origResolve = require.resolve;

//   afterEach(() => {
//     require.resolve = origResolve;
//   });

//   it("does nothing for fetch", () => {
//     expect(() => ensureHttpLibInstalled("fetch")).not.toThrow();
//   });

//   it("passes if dependency is installed", () => {
//     const mockResolve = (() => "/fake/path") as any;
//     (mockResolve as any).paths = [];
//     require.resolve = mockResolve;

//     expect(() => ensureHttpLibInstalled("axios")).not.toThrow();
//   });

//   it("throws MissingDependencyError if missing", async () => {
//     const mockResolve = (() => {
//       throw new Error("not found");
//     }) as any;
//     (mockResolve as any).paths = [];
//     require.resolve = mockResolve;

//     await expect(() => ensureHttpLibInstalled("axios")).rejects.throw(
//       MissingDependencyError
//     );
//   });
// });
