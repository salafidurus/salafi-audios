import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { AnalyticsPrismaClient } from "./index";

describe("analytics database boundary", () => {
  it("exposes a client distinct from the primary Prisma client", () => {
    expect(typeof AnalyticsPrismaClient).toBe("function");
  });

  it("keeps archive models in the explicit analytics PostgreSQL schema", () => {
    const schema = readFileSync(
      resolve(import.meta.dir, "../prisma/analytics/schema.prisma"),
      "utf8",
    );

    expect(schema).toContain('schemas  = ["analytics"]');
    expect(schema).toContain('@@schema("analytics")');
  });
});
