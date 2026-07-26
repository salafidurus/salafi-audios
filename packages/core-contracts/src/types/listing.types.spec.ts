import { describe, it, expect } from "bun:test";
import {
  AdminListingDetailDtoSchema,
  CreateListingDtoSchema,
  ListingFormDataDtoSchema,
  UpdateListingDetailsDtoSchema,
  AdminListingMediaDetailDtoSchema,
  UpdateListingMediaDtoSchema,
  ArrangeCommitDtoSchema,
  ArrangeLessonOpSchema,
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

describe("CreateListingDtoSchema", () => {
  it("parses a valid create payload (main-language-only)", () => {
    const result = CreateListingDtoSchema.parse({
      title: "Test Lecture",
      format: "single",
      scholarId: "scholar-1",
      language: "ar",
    });
    expect(result.title).toBe("Test Lecture");
  });
});

describe("UpdateListingDetailsDtoSchema", () => {
  it("parses a valid update payload (main-language-only)", () => {
    const result = UpdateListingDetailsDtoSchema.parse({
      title: "Updated Title",
    });
    expect(result.title).toBe("Updated Title");
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

  describe("UpdateListingDetailsDtoSchema & Media DTOs", () => {
    it("parses valid UpdateListingDetailsDto payload", () => {
      const parsed = UpdateListingDetailsDtoSchema.parse({
        title: "Updated Title",
        description: "Updated Desc",
        status: "draft",
        orderIndex: 2,
      });
      expect(parsed.title).toBe("Updated Title");
    });

    it("parses valid AdminListingMediaDetailDto payload", () => {
      const parsed = AdminListingMediaDetailDtoSchema.parse({
        id: "listing-1",
        title: "Audio Title",
        audioKey: "audio/key.mp3",
        durationSeconds: 120,
        format: "single",
      });
      expect(parsed.audioKey).toBe("audio/key.mp3");
      expect(parsed.durationSeconds).toBe(120);
    });

    it("parses valid UpdateListingMediaDto payload", () => {
      const parsed = UpdateListingMediaDtoSchema.parse({
        audioKey: "audio/new-key.mp3",
        durationSeconds: 180,
        sizeBytes: 1048576,
      });
      expect(parsed.audioKey).toBe("audio/new-key.mp3");
      expect(parsed.sizeBytes).toBe(1048576);
    });
  });
});

describe("ArrangeCommitDtoSchema", () => {
  const createLesson = {
    op: "create",
    slug: "ajurumiyyah-kalam",
    title: "Al-Kalam",
    audio: { objectKey: "audio/ajurumiyyah/ajurumiyyah-kalam.mp3", durationSeconds: 1200 },
  };

  it("parses a series commit with lesson create and update ops", () => {
    const parsed = ArrangeCommitDtoSchema.parse({
      lessons: [createLesson, { op: "update", id: "lesson-1", orderIndex: 2 }],
    });
    expect(parsed.lessons).toHaveLength(2);
    expect(parsed.modules).toBeUndefined();
  });

  it("parses a collection commit with nested module ops", () => {
    const parsed = ArrangeCommitDtoSchema.parse({
      modules: [
        { op: "create", slug: "bukhari-ilm", title: "Ilm", lessons: [createLesson] },
        { op: "update", id: "module-1", lessons: [] },
      ],
    });
    expect(parsed.modules).toHaveLength(2);
  });

  it("rejects a commit with both lessons and modules", () => {
    expect(() => ArrangeCommitDtoSchema.parse({ lessons: [], modules: [] })).toThrow();
  });

  it("rejects a commit with neither lessons nor modules", () => {
    expect(() => ArrangeCommitDtoSchema.parse({})).toThrow();
  });

  it("requires audio on lesson create but not on lesson update", () => {
    expect(() => ArrangeLessonOpSchema.parse({ op: "create", slug: "s-a", title: "A" })).toThrow();
    const updated = ArrangeLessonOpSchema.parse({ op: "update", id: "lesson-1" });
    expect(updated.op).toBe("update");
  });
});
