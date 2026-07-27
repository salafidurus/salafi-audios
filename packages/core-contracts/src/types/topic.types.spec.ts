import { describe, it, expect } from "bun:test";
import {
  AdminTopicDetailDtoSchema,
  CreateTopicWithTranslationsDtoSchema,
  UpdateTopicWithTranslationsDtoSchema,
} from "./topic.types";

describe("AdminTopicDetailDtoSchema", () => {
  it("parses a valid topic detail with translations", () => {
    const result = AdminTopicDetailDtoSchema.parse({
      id: "topic-1",
      slug: "aqeedah",
      name: { ar: "العقيدة", en: "Aqeedah" },
      createdAt: "2026-07-23T00:00:00.000Z",
      translations: [
        {
          locale: "en",
          status: "draft",
          fields: { name: "Aqeedah" },
          createdAt: "2026-07-23T00:00:00.000Z",
          updatedAt: "2026-07-23T00:00:00.000Z",
        },
      ],
    });
    expect(result.id).toBe("topic-1");
    expect(result.translations).toHaveLength(1);
    expect(result.translations[0].locale).toBe("en");
  });

  it("parses topic detail without translations", () => {
    const result = AdminTopicDetailDtoSchema.parse({
      id: "topic-2",
      slug: "fiqh",
      name: { ar: "الفقه" },
      createdAt: "2026-07-23T00:00:00.000Z",
      translations: [],
    });
    expect(result.translations).toHaveLength(0);
  });

  it("rejects missing id", () => {
    expect(() =>
      AdminTopicDetailDtoSchema.parse({
        slug: "aqeedah",
        name: { ar: "العقيدة" },
        createdAt: "2026-07-23T00:00:00.000Z",
        translations: [],
      }),
    ).toThrow();
  });
});

describe("CreateTopicWithTranslationsDtoSchema", () => {
  it("parses a valid create payload (main-language-only, Arabic is the main language)", () => {
    const result = CreateTopicWithTranslationsDtoSchema.parse({
      slug: "aqeedah",
      name: { ar: "العقيدة" },
    });
    expect(result.slug).toBe("aqeedah");
    expect(result.name.ar).toBe("العقيدة");
  });

  it("rejects missing slug", () => {
    expect(() =>
      CreateTopicWithTranslationsDtoSchema.parse({
        name: { ar: "العقيدة" },
      }),
    ).toThrow();
  });

  it("rejects missing name.ar", () => {
    expect(() =>
      CreateTopicWithTranslationsDtoSchema.parse({
        slug: "aqeedah",
        name: {},
      }),
    ).toThrow();
  });
});

describe("UpdateTopicWithTranslationsDtoSchema", () => {
  it("parses a valid update payload (main-language-only)", () => {
    const result = UpdateTopicWithTranslationsDtoSchema.parse({
      name: { ar: "العقيدة" },
    });
    expect(result.name.ar).toBe("العقيدة");
  });

  it("rejects empty name.ar", () => {
    expect(() =>
      UpdateTopicWithTranslationsDtoSchema.parse({
        name: { ar: "" },
      }),
    ).toThrow();
  });

  it("strips an injected slug — slug is immutable after creation and cannot be updated via this DTO", () => {
    const result = UpdateTopicWithTranslationsDtoSchema.parse({
      name: { ar: "العقيدة" },
      slug: "hacked-slug",
    });
    expect(result).not.toHaveProperty("slug");
  });
});
