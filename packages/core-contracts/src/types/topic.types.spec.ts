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
      name: { en: "Aqeedah", ar: "العقيدة" },
      createdAt: "2026-07-23T00:00:00.000Z",
      translations: [
        {
          locale: "ar",
          status: "draft",
          fields: { name: "العقيدة" },
          createdAt: "2026-07-23T00:00:00.000Z",
          updatedAt: "2026-07-23T00:00:00.000Z",
        },
      ],
    });
    expect(result.id).toBe("topic-1");
    expect(result.translations).toHaveLength(1);
    expect(result.translations[0].locale).toBe("ar");
  });

  it("parses topic detail without translations", () => {
    const result = AdminTopicDetailDtoSchema.parse({
      id: "topic-2",
      slug: "fiqh",
      name: { en: "Fiqh" },
      createdAt: "2026-07-23T00:00:00.000Z",
      translations: [],
    });
    expect(result.translations).toHaveLength(0);
  });

  it("rejects missing id", () => {
    expect(() =>
      AdminTopicDetailDtoSchema.parse({
        slug: "aqeedah",
        name: { en: "Aqeedah" },
        createdAt: "2026-07-23T00:00:00.000Z",
        translations: [],
      }),
    ).toThrow();
  });
});

describe("CreateTopicWithTranslationsDtoSchema", () => {
  it("parses a valid create payload (main-language-only)", () => {
    const result = CreateTopicWithTranslationsDtoSchema.parse({
      slug: "aqeedah",
      name: { en: "Aqeedah" },
    });
    expect(result.slug).toBe("aqeedah");
    expect(result.name.en).toBe("Aqeedah");
  });

  it("rejects missing slug", () => {
    expect(() =>
      CreateTopicWithTranslationsDtoSchema.parse({
        name: { en: "Aqeedah" },
      }),
    ).toThrow();
  });

  it("rejects missing name.en", () => {
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
      name: { en: "Aqeedah" },
    });
    expect(result.name.en).toBe("Aqeedah");
  });

  it("rejects empty name.en", () => {
    expect(() =>
      UpdateTopicWithTranslationsDtoSchema.parse({
        name: { en: "" },
      }),
    ).toThrow();
  });

  it("strips an injected slug — slug is immutable after creation and cannot be updated via this DTO", () => {
    const result = UpdateTopicWithTranslationsDtoSchema.parse({
      name: { en: "Aqeedah" },
      slug: "hacked-slug",
    });
    expect(result).not.toHaveProperty("slug");
  });
});
