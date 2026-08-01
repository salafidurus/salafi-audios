import { describe, it, expect, vi, beforeEach, type Mock } from "bun:test";

import { fetchArrangeData } from "@/features/admin/api/admin-lectures.api";
import { fetchAdminTopic } from "@/features/admin/api/admin.api";

import { translationEntities } from "./translation-entities";

vi.mock("@/features/admin/api/admin-lectures.api", () => ({
  fetchListingFormData: vi.fn(),
  fetchArrangeData: vi.fn(),
}));

vi.mock("@/features/admin/api/admin.api", () => ({
  fetchScholarFormData: vi.fn(),
  fetchAdminTopic: vi.fn(),
}));

describe("topicConfig.load", () => {
  it("uses Arabic as the main locale and source, since Arabic is a Topic's main language", async () => {
    (fetchAdminTopic as Mock<any>).mockResolvedValue({
      id: "topic-1",
      slug: "aqeedah",
      name: { ar: "العقيدة", en: "Aqeedah" },
      orderIndex: 1,
      createdAt: "2026-01-01",
      translations: [],
    });

    const result = await translationEntities.topic.load({
      entity: "topic",
      topicId: "topic-1",
      topicSlug: "aqeedah",
    });

    expect(result.mainLocale).toBe("ar");
    expect(result.source).toEqual({ name: "العقيدة" });
  });
});

describe("listingConfig.loadChildren", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("flattens top-level lessons and module lessons, indenting only the nested ones", async () => {
    (fetchArrangeData as Mock<any>).mockResolvedValue({
      id: "root-1",
      slug: "root",
      title: "Root series",
      format: "collection",
      scholarId: "scholar-1",
      status: "draft",
      lessons: [
        {
          id: "lesson-top",
          slug: "top",
          title: "Top-level lesson",
          status: "draft",
          hasAudio: true,
        },
      ],
      modules: [
        {
          id: "module-1",
          slug: "mod-1",
          title: "Module One",
          status: "draft",
          hasAudio: false,
          lessons: [
            {
              id: "lesson-1a",
              slug: "1a",
              title: "Lesson 1A",
              status: "draft",
              hasAudio: true,
            },
            {
              id: "lesson-1b",
              slug: "1b",
              title: "Lesson 1B",
              status: "draft",
              hasAudio: true,
            },
          ],
        },
      ],
    });

    const children = await translationEntities.listing.loadChildren!("root-1");

    expect(fetchArrangeData).toHaveBeenCalledWith("root-1");
    expect(children).toEqual([
      { id: "lesson-top", title: "Top-level lesson", kind: "lesson", indent: false },
      { id: "module-1", title: "Module One", kind: "module", indent: false },
      { id: "lesson-1a", title: "Lesson 1A", kind: "lesson", indent: true },
      { id: "lesson-1b", title: "Lesson 1B", kind: "lesson", indent: true },
    ]);
  });

  it("returns an empty list when the listing has no modules or lessons", async () => {
    (fetchArrangeData as Mock<any>).mockResolvedValue({
      id: "root-2",
      slug: "root-2",
      title: "Empty series",
      format: "series",
      scholarId: "scholar-1",
      status: "draft",
      lessons: [],
      modules: [],
    });

    const children = await translationEntities.listing.loadChildren!("root-2");
    expect(children).toEqual([]);
  });

  it("scholar and topic configs do not support children", () => {
    expect(translationEntities.scholar.supportsChildren).toBeFalsy();
    expect(translationEntities.scholar.loadChildren).toBeUndefined();
    expect(translationEntities.topic.supportsChildren).toBeFalsy();
    expect(translationEntities.topic.loadChildren).toBeUndefined();
  });
});
