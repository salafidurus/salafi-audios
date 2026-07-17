import { describe, it, expect } from "bun:test";
import * as coreApi from "./index";

describe("@sd/core-api", () => {
  it("should export from index", () => {
    expect(coreApi).toBeDefined();
  });
});
