import { describe, expect, it } from "bun:test";

import { parseAccessArgs } from "./grant-access";

describe("grant:access argument parsing", () => {
  it("parses a multi-scholar write grant", () => {
    expect(
      parseAccessArgs([
        "user@example.com",
        "listing",
        "write",
        "--scholars",
        "ibn-baz,ibn-taymiyyah",
      ]),
    ).toEqual({
      email: "user@example.com",
      target: "listing",
      capability: "write",
      scholarSlugs: ["ibn-baz", "ibn-taymiyyah"],
      locales: [],
    });
  });

  it("parses translation locale scope", () => {
    expect(
      parseAccessArgs(["user@example.com", "translation", "translate", "--locales", "ar,en"]),
    ).toMatchObject({ scholarSlugs: [], locales: ["ar", "en"] });
  });

  it("rejects invalid target/capability combinations", () => {
    expect(() => parseAccessArgs(["user@example.com", "topic", "translate"])).toThrow();
    expect(() => parseAccessArgs(["user@example.com", "translation", "translate"])).toThrow();
  });
});
