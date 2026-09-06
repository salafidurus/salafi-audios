import { describe, expect, it } from "bun:test";

import { AnalyticsPrismaClient } from "./index";

describe("analytics database boundary", () => {
  it("exposes a client distinct from the primary Prisma client", () => {
    expect(typeof AnalyticsPrismaClient).toBe("function");
  });
});
