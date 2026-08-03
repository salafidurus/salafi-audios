import { describe, expect, it } from "bun:test";

import { AccessGrantRequestSchema } from "./access.types";

describe("AccessGrantRequestSchema", () => {
  it("accepts a write grant scoped to more than one scholar", () => {
    expect(
      AccessGrantRequestSchema.parse({
        target: "listing",
        capability: "write",
        scholarSlugs: ["ibn-taymiyyah", "ibn-baz"],
      }),
    ).toMatchObject({
      target: "listing",
      capability: "write",
      scholarSlugs: ["ibn-taymiyyah", "ibn-baz"],
      locales: [],
    });
  });

  it("rejects a scholar scope for topics", () => {
    expect(() =>
      AccessGrantRequestSchema.parse({
        target: "topic",
        capability: "write",
        scholarSlugs: ["ibn-taymiyyah"],
      }),
    ).toThrow();
  });
});
