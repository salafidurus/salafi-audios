import { describe, it, expect } from "bun:test";
import {
  AdminScholarListItemDtoSchema,
  CreateScholarDtoSchema,
  ScholarFormDataDtoSchema,
} from "./scholar.types";

describe("AdminScholarTranslationSchema (via AdminScholarListItemDtoSchema)", () => {
  it("parses valid scholar list item with translation locale", () => {
    const result = AdminScholarListItemDtoSchema.parse({
      id: "scholar-1",
      slug: "al-albani",
      name: "Muhammad Nasiruddin al-Albani",
      isActive: true,
      createdAt: "2026-07-23T00:00:00.000Z",
      translations: [
        {
          locale: "ar",
          name: "محمد ناصر الدين الألباني",
          status: "published",
        },
      ],
    });
    expect(result.id).toBe("scholar-1");
    expect(result.translations).toHaveLength(1);
    expect(result.translations[0].locale).toBe("ar");
  });

  it("rejects invalid locale in translations (Bug 4 fix)", () => {
    expect(() =>
      AdminScholarListItemDtoSchema.parse({
        id: "scholar-1",
        slug: "al-albani",
        name: "Muhammad Nasiruddin al-Albani",
        isActive: true,
        createdAt: "2026-07-23T00:00:00.000Z",
        translations: [
          {
            locale: "fr", // Invalid: not in SUPPORTED_LOCALES
            name: "test",
            status: "published",
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects typo'd locale in translations", () => {
    expect(() =>
      AdminScholarListItemDtoSchema.parse({
        id: "scholar-1",
        slug: "al-albani",
        name: "Muhammad Nasiruddin al-Albani",
        isActive: true,
        createdAt: "2026-07-23T00:00:00.000Z",
        translations: [
          {
            locale: "arr", // Typo of 'ar'
            name: "test",
            status: "published",
          },
        ],
      }),
    ).toThrow();
  });
});

describe("CreateScholarDtoSchema", () => {
  it("parses a valid create payload (main-language-only)", () => {
    const result = CreateScholarDtoSchema.parse({
      name: "Test Scholar",
      slug: "test-scholar",
      mainLanguage: "ar",
    });
    expect(result.name).toBe("Test Scholar");
  });
});

describe("ScholarFormDataDtoSchema (getFormData response shape)", () => {
  it("parses valid form data with scholar and translations array", () => {
    const result = ScholarFormDataDtoSchema.parse({
      scholar: {
        id: "scholar-1",
        name: "Test Scholar",
        slug: "test-scholar",
        mainLanguage: "ar",
        isActive: true,
        createdAt: "2026-07-23T00:00:00.000Z",
      },
      translations: [
        {
          locale: "en",
          status: "draft",
          fields: { name: "Test Scholar", bio: "Bio in English" },
          createdAt: "2026-07-23T00:00:00.000Z",
          updatedAt: "2026-07-23T00:00:00.000Z",
        },
      ],
    });
    expect(result.scholar.id).toBe("scholar-1");
    expect(result.translations).toHaveLength(1);
    expect(result.translations[0].locale).toBe("en");
    expect(result.translations[0].fields.name).toBe("Test Scholar");
  });

  it("accepts form data with empty translations array", () => {
    const result = ScholarFormDataDtoSchema.parse({
      scholar: {
        id: "scholar-1",
        name: "Test Scholar",
        slug: "test-scholar",
        isActive: true,
        createdAt: "2026-07-23T00:00:00.000Z",
      },
      translations: [],
    });
    expect(result.translations).toHaveLength(0);
  });

  it("includes optional scholar fields when present", () => {
    const result = ScholarFormDataDtoSchema.parse({
      scholar: {
        id: "scholar-1",
        name: "Test Scholar",
        slug: "test-scholar",
        bio: "Bio text",
        imageUrl: "https://example.com/image.jpg",
        country: "SA",
        mainLanguage: "ar",
        title: "allamah",
        socialTwitter: "https://twitter.com/test",
        isActive: true,
        createdAt: "2026-07-23T00:00:00.000Z",
        updatedAt: "2026-07-23T00:00:00.000Z",
      },
      translations: [],
    });
    expect(result.scholar.bio).toBe("Bio text");
    expect(result.scholar.title).toBe("allamah");
  });
});
