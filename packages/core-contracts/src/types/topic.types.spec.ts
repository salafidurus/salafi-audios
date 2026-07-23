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
  it("parses valid create payload without translations", () => {
    const result = CreateTopicWithTranslationsDtoSchema.parse({
      slug: "aqeedah",
      name: { en: "Aqeedah" },
    });
    expect(result.slug).toBe("aqeedah");
    expect(result.name.en).toBe("Aqeedah");
  });

  it("parses valid create payload with translations", () => {
    const result = CreateTopicWithTranslationsDtoSchema.parse({
      slug: "aqeedah",
      name: { en: "Aqeedah" },
      translations: [{ locale: "ar", name: "العقيدة" }],
    });
    expect(result.translations).toHaveLength(1);
    expect(result.translations![0].locale).toBe("ar");
  });

  it("accepts empty string as translation name (signals deletion on update)", () => {
    const result = CreateTopicWithTranslationsDtoSchema.parse({
      slug: "aqeedah",
      name: { en: "Aqeedah" },
      translations: [{ locale: "ar", name: "" }],
    });
    expect(result.translations![0].name).toBe("");
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

  it("rejects invalid locale in translations", () => {
    expect(() =>
      CreateTopicWithTranslationsDtoSchema.parse({
        slug: "aqeedah",
        name: { en: "Aqeedah" },
        translations: [{ locale: "fr", name: "Croyance" }],
      }),
    ).toThrow();
  });
});

describe("UpdateTopicWithTranslationsDtoSchema", () => {
  it("parses valid update payload with translations", () => {
    const result = UpdateTopicWithTranslationsDtoSchema.parse({
      name: { en: "Aqeedah" },
      translations: [{ locale: "ar", name: "العقيدة" }],
    });
    expect(result.name.en).toBe("Aqeedah");
    expect(result.translations).toHaveLength(1);
  });

  it("accepts empty name string in translations (signals deletion)", () => {
    const result = UpdateTopicWithTranslationsDtoSchema.parse({
      name: { en: "Aqeedah" },
      translations: [{ locale: "ar", name: "" }],
    });
    expect(result.translations[0].name).toBe("");
  });

  it("rejects missing translations", () => {
    expect(() =>
      UpdateTopicWithTranslationsDtoSchema.parse({
        name: { en: "Aqeedah" },
      }),
    ).toThrow();
  });

  it("rejects empty name.en", () => {
    expect(() =>
      UpdateTopicWithTranslationsDtoSchema.parse({
        name: { en: "" },
        translations: [],
      }),
    ).toThrow();
  });

  it("rejects invalid locale in translations", () => {
    expect(() =>
      UpdateTopicWithTranslationsDtoSchema.parse({
        name: { en: "Aqeedah" },
        translations: [{ locale: "invalid", name: "test" }],
      }),
    ).toThrow();
  });
});

describe("Array-based translations avoid Record undefined bug", () => {
  it("CreateTopicWithTranslationsDto: array format accepts empty translations", () => {
    const result = CreateTopicWithTranslationsDtoSchema.parse({
      slug: "test",
      name: { en: "Test" },
      translations: [],
    });
    expect(result.translations).toHaveLength(0);
  });

  it("UpdateTopicWithTranslationsDto: array format never produces undefined values", () => {
    const raw = {
      name: { en: "Test" },
      translations: [{ locale: "ar", name: undefined as any }],
    };
    expect(() => UpdateTopicWithTranslationsDtoSchema.parse(raw)).toThrow();
  });
});
