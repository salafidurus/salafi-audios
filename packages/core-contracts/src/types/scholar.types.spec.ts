import { describe, it, expect } from "bun:test";
import { AdminScholarListItemDtoSchema } from "./scholar.types";

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
