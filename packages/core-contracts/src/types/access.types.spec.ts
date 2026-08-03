import { describe, expect, it } from "bun:test";

import {
  AccessGrantRequestSchema,
  ReplaceUserAccessRequestSchema,
  UserAccessSnapshotSchema,
} from "./access.types";

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

  it("rejects content capabilities that do not apply to the target", () => {
    expect(() =>
      AccessGrantRequestSchema.parse({
        target: "topic",
        capability: "translate",
      }),
    ).toThrow();
    expect(() =>
      AccessGrantRequestSchema.parse({
        target: "translation",
        capability: "write",
        locales: ["ar"],
      }),
    ).toThrow();
  });

  it("requires locale scope for translation grants and rejects it elsewhere", () => {
    expect(() =>
      AccessGrantRequestSchema.parse({ target: "translation", capability: "translate" }),
    ).toThrow();
    expect(() =>
      AccessGrantRequestSchema.parse({ target: "listing", capability: "write", locales: ["ar"] }),
    ).toThrow();
  });

  it("allows user management only as a global manage grant", () => {
    expect(AccessGrantRequestSchema.parse({ target: "user", capability: "manage" })).toMatchObject({
      target: "user",
      capability: "manage",
      scholarSlugs: [],
      locales: [],
    });
    expect(() => AccessGrantRequestSchema.parse({ target: "user", capability: "write" })).toThrow();
  });

  it("accepts an aggregate access snapshot and versioned replacement", () => {
    const grant = {
      target: "listing",
      capability: "write",
      scholarSlugs: ["ibn-baz"],
      locales: [],
    };
    expect(
      UserAccessSnapshotSchema.parse({
        userId: "user-1",
        version: 3,
        grants: [grant],
        roles: ["Editor"],
        isSuperadmin: false,
        scholars: [{ slug: "ibn-baz", name: "Ibn Baz" }],
      }).version,
    ).toBe(3);
    expect(
      ReplaceUserAccessRequestSchema.parse({ version: 3, grants: [grant] }).grants,
    ).toHaveLength(1);
  });
});
