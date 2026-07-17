import { describe, it, expect } from "bun:test";
import * as domainAccount from "./index";

describe("@sd/domain-account", () => {
  it("should export from index", () => {
    expect(domainAccount).toBeDefined();
  });
});
