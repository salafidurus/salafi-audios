import { describe, it, expect } from "bun:test";
import {
  AdminListingDetailDtoSchema,
  CreateListingDtoSchema,
  AdminListingUpdateDtoSchema,
  ListingFormDataDtoSchema,
} from "./listing.types";

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

describe("CreateListingDtoSchema (array-shaped translations - Bug 1 fix)", () => {
  it("parses valid create payload with array-shaped translations", () => {
    const result = CreateListingDtoSchema.parse({
      title: "Test Lecture",
      format: "single",
      scholarId: "scholar-1",
      language: "ar",
      translations: [
        {
          locale: "en",
          title: "Test Lecture English",
          description: "Description in English",
        },
      ],
    });
    expect(result.title).toBe("Test Lecture");
    expect(result.translations).toHaveLength(1);
    expect(result.translations![0].locale).toBe("en");
  });

  it("accepts translations array with both language and secondary locale (Bug 1 fix)", () => {
    const result = CreateListingDtoSchema.parse({
      title: "محاضرة",
      format: "single",
      scholarId: "scholar-1",
      language: "ar",
      translations: [
        { locale: "ar", title: "محاضرة", description: "وصف" },
        { locale: "en", title: "Lecture", description: "Description" },
      ],
    });
    expect(result.translations).toHaveLength(2);
    expect(result.translations!.map((t) => t.locale)).toEqual(["ar", "en"]);
  });

  it("accepts empty translations array", () => {
    const result = CreateListingDtoSchema.parse({
      title: "Lecture",
      format: "single",
      scholarId: "scholar-1",
      translations: [],
    });
    expect(result.translations).toHaveLength(0);
  });
});

describe("AdminListingUpdateDtoSchema (array-shaped translations - Bug 1 fix)", () => {
  it("parses valid update payload with array-shaped translations", () => {
    const result = AdminListingUpdateDtoSchema.parse({
      title: "Updated Title",
      translations: [{ locale: "en", title: "English Title", description: null }],
    });
    expect(result.title).toBe("Updated Title");
    expect(result.translations).toHaveLength(1);
  });

  it("accepts translations array with both language and secondary locale (Bug 1 fix)", () => {
    const result = AdminListingUpdateDtoSchema.parse({
      title: "تحديث",
      language: "ar",
      translations: [
        { locale: "ar", title: "تحديث", description: null },
        { locale: "en", title: "Update", description: "Update description" },
      ],
    });
    expect(result.translations).toHaveLength(2);
  });
});

describe("ListingFormDataDtoSchema (getFormData response shape)", () => {
  it("parses valid form data with listing and translations array", () => {
    const result = ListingFormDataDtoSchema.parse({
      listing: {
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
      },
      translations: [
        {
          locale: "en",
          status: "draft",
          fields: { title: "Test Lecture", description: "Description in English" },
          createdAt: "2026-07-23T00:00:00.000Z",
          updatedAt: "2026-07-23T00:00:00.000Z",
        },
      ],
    });
    expect(result.listing.id).toBe("listing-1");
    expect(result.translations).toHaveLength(1);
    expect(result.translations[0].locale).toBe("en");
    expect(result.translations[0].fields.title).toBe("Test Lecture");
  });

  it("accepts form data with empty translations array", () => {
    const result = ListingFormDataDtoSchema.parse({
      listing: {
        id: "listing-1",
        slug: "test-lecture",
        title: "Test Lecture",
        format: "single",
        status: "draft",
        scholarId: "scholar-1",
        scholarName: "Scholar Name",
        topics: [],
        createdAt: "2026-07-23T00:00:00.000Z",
      },
      translations: [],
    });
    expect(result.translations).toHaveLength(0);
  });

  it("includes optional listing fields when present", () => {
    const result = ListingFormDataDtoSchema.parse({
      listing: {
        id: "listing-1",
        slug: "test-lecture",
        title: "Test Lecture",
        description: "Lecture description",
        format: "series",
        language: "ar",
        status: "published",
        orderIndex: 5,
        durationSeconds: 3600,
        scholarId: "scholar-1",
        scholarName: "Scholar Name",
        parentId: "parent-1",
        topics: ["topic-1", "topic-2"],
        audioUrl: "https://example.com/audio.mp3",
        createdAt: "2026-07-23T00:00:00.000Z",
        updatedAt: "2026-07-23T00:00:00.000Z",
      },
      translations: [],
    });
    expect(result.listing.description).toBe("Lecture description");
    expect(result.listing.orderIndex).toBe(5);
    expect(result.listing.topics).toHaveLength(2);
  });
});
