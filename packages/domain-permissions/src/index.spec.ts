import { describe, it, expect } from "bun:test";
import * as domainPermissions from "./index";

describe("@sd/domain-permissions", () => {
  it("should export from index", () => {
    expect(domainPermissions).toBeDefined();
  });
});
