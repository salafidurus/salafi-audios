import { describe, expect, it } from "bun:test";

import {
  AudioProgressDtoSchema,
  LastPlayedLessonDtoSchema,
  ListingProgressSummaryDtoSchema,
  ProgressSyncItemDtoSchema,
  RecentProgressDtoSchema,
  TopicLectureViewDtoSchema,
} from "./index";

describe("public content identity contracts", () => {
  it("requires public slugs on progress payloads and removes internal listing identity", () => {
    const progress = AudioProgressDtoSchema.parse({
      listingId: "internal-listing-id",
      listingSlug: "tafsir-al-fatiha",
      positionSeconds: 30,
      durationSeconds: 120,
      updatedAt: "2026-08-26T00:00:00.000Z",
    });

    expect(progress.listingSlug).toBe("tafsir-al-fatiha");
    expect(progress).not.toHaveProperty("listingId");

    expect(
      ProgressSyncItemDtoSchema.parse({
        listingSlug: "tafsir-al-fatiha",
        positionSeconds: 30,
        durationSeconds: 120,
        updatedAt: "2026-08-26T00:00:00.000Z",
      }).listingSlug,
    ).toBe("tafsir-al-fatiha");

    expect(() =>
      ProgressSyncItemDtoSchema.parse({
        listingId: "internal-listing-id",
        positionSeconds: 30,
        durationSeconds: 120,
        updatedAt: "2026-08-26T00:00:00.000Z",
      }),
    ).toThrow();
  });

  it("exposes public listing identity on related progress projections", () => {
    expect(
      LastPlayedLessonDtoSchema.parse({
        listingId: "lesson-id",
        listingSlug: "lesson-slug",
        positionSeconds: 30,
        isCompleted: false,
        updatedAt: "2026-08-26T00:00:00.000Z",
      }).listingSlug,
    ).toBe("lesson-slug");

    expect(
      ListingProgressSummaryDtoSchema.parse({
        listingId: "series-id",
        listingSlug: "series-slug",
        format: "series",
        totalCount: 2,
        completedCount: 1,
        percentComplete: 50,
        isCompleted: false,
      }).listingSlug,
    ).toBe("series-slug");
  });

  it("uses explicit public identities for home and topic content", () => {
    expect(
      RecentProgressDtoSchema.parse({
        lectureId: "lesson-id",
        lectureTitle: "Lesson",
        lectureSlug: "lesson-slug",
        listingSlug: "lesson-slug",
        format: "single",
        scholarName: "Scholar",
        scholarSlug: "scholar-slug",
        durationSeconds: 120,
        positionSeconds: 30,
      }).listingSlug,
    ).toBe("lesson-slug");

    expect(
      TopicLectureViewDtoSchema.parse({
        id: "lesson-id",
        scholarId: "scholar-id",
        scholarSlug: "scholar-slug",
        slug: "lesson-slug",
        title: "Lesson",
        status: "published",
      }).scholarSlug,
    ).toBe("scholar-slug");
  });
});
