import { describe, it, expect } from "bun:test";
import { AdminScholarListItemDtoSchema, CreateScholarDtoSchema } from "./scholar.types";

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

describe("CreateScholarDtoSchema (array-shaped translations - Bug 1 fix)", () => {
  it("parses valid create payload with array-shaped translations", () => {
    const result = CreateScholarDtoSchema.parse({
      name: "Test Scholar",
      slug: "test-scholar",
      mainLanguage: "ar",
      translations: [{ locale: "en", name: "Test Scholar English", bio: "Bio in English" }],
    });
    expect(result.name).toBe("Test Scholar");
    expect(result.translations).toHaveLength(1);
    expect(result.translations![0].locale).toBe("en");
  });

  it("accepts translations array with both mainLanguage and secondary locale (Bug 1 fix)", () => {
    // This tests the direct bug fix: sending both ar and en in one array
    // should NOT fail validation (was the exhaustive-record bug)
    const result = CreateScholarDtoSchema.parse({
      name: "Scholar",
      slug: "scholar",
      mainLanguage: "ar",
      translations: [
        { locale: "ar", name: "عالم", bio: "سيرة ذاتية" },
        { locale: "en", name: "Scholar", bio: "Biography" },
      ],
    });
    expect(result.translations).toHaveLength(2);
    expect(result.translations!.map((t) => t.locale)).toEqual(["ar", "en"]);
  });

  it("accepts empty translations array", () => {
    const result = CreateScholarDtoSchema.parse({
      name: "Scholar",
      slug: "scholar",
      translations: [],
    });
    expect(result.translations).toHaveLength(0);
  });

  it("rejects invalid locale in translations array", () => {
    expect(() =>
      CreateScholarDtoSchema.parse({
        name: "Scholar",
        slug: "scholar",
        translations: [{ locale: "fr", name: "test", bio: null }],
      }),
    ).toThrow();
  });
});
