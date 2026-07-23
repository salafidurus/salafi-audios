import { describe, it, expect } from "bun:test";
import { AdminListingDetailDtoSchema } from "./listing.types";

describe("AdminListingDetailDtoSchema (Bug 4 fix: language type)", () => {
  it("parses valid admin listing detail with language locale", () => {
    const result = AdminListingDetailDtoSchema.parse({
      id: "listing-1",
      slug: "test-lecture",
      title: "Test Lecture",
      format: "single",
      language: "ar",
      status: "draft",
      scholarId: "scholar-1",
      scholarName: "Scholar Name",
      topics: ["topic-1"],
      createdAt: "2026-07-23T00:00:00.000Z",
    });
    expect(result.id).toBe("listing-1");
    expect(result.language).toBe("ar");
  });

  it("rejects invalid locale in language field", () => {
    expect(() =>
      AdminListingDetailDtoSchema.parse({
        id: "listing-1",
        slug: "test-lecture",
        title: "Test Lecture",
        format: "single",
        language: "fr", // Invalid: not in SUPPORTED_LOCALES
        status: "draft",
        scholarId: "scholar-1",
        scholarName: "Scholar Name",
        topics: ["topic-1"],
        createdAt: "2026-07-23T00:00:00.000Z",
      }),
    ).toThrow();
  });

  it("rejects typo'd locale in language field", () => {
    expect(() =>
      AdminListingDetailDtoSchema.parse({
        id: "listing-1",
        slug: "test-lecture",
        title: "Test Lecture",
        format: "single",
        language: "arr", // Typo of 'ar'
        status: "draft",
        scholarId: "scholar-1",
        scholarName: "Scholar Name",
        topics: ["topic-1"],
        createdAt: "2026-07-23T00:00:00.000Z",
      }),
    ).toThrow();
  });

  it("accepts undefined language (optional field)", () => {
    const result = AdminListingDetailDtoSchema.parse({
      id: "listing-1",
      slug: "test-lecture",
      title: "Test Lecture",
      format: "single",
      status: "draft",
      scholarId: "scholar-1",
      scholarName: "Scholar Name",
      topics: ["topic-1"],
      createdAt: "2026-07-23T00:00:00.000Z",
    });
    expect(result.language).toBeUndefined();
  });
});
