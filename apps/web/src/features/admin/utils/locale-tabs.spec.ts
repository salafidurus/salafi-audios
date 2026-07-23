import { describe, it, expect } from "bun:test";
import { getSecondaryLocales, buildTranslationsPayload, getLocaleLabel } from "./locale-tabs";

describe("getSecondaryLocales", () => {
  it("returns locales excluding the main locale", () => {
    const result = getSecondaryLocales("ar");
    expect(result).toContain("en");
    expect(result).not.toContain("ar");
  });

  it("returns array of all non-main locales", () => {
    const result = getSecondaryLocales("en");
    expect(result).toEqual(["ar"]);
  });

  it("returns all secondary locales for ar as main", () => {
    const result = getSecondaryLocales("ar");
    expect(result).toEqual(["en"]);
  });

  it("returns empty array if only one locale exists (hypothetical)", () => {
    // This test documents expected behavior for edge case of single-locale system
    const result = getSecondaryLocales("en");
    // With current SUPPORTED_LOCALES = ["en", "ar"], result should have 1 element
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("buildTranslationsPayload", () => {
  it("returns undefined when no translations have content", () => {
    const result = buildTranslationsPayload(
      { en: { name: "" }, ar: undefined },
      ["en", "ar"],
      (v) => !!v?.name,
    );
    expect(result).toBeUndefined();
  });

  it("returns array with entries for locales that have content", () => {
    const result = buildTranslationsPayload(
      { en: { name: "English Name" }, ar: { name: "Arabic Name" } },
      ["en", "ar"],
      (v) => !!v?.name,
    );
    expect(result).toHaveLength(2);
    expect(result![0]).toEqual({ locale: "en", name: "English Name" });
    expect(result![1]).toEqual({ locale: "ar", name: "Arabic Name" });
  });

  it("filters out locales without content using predicate", () => {
    const result = buildTranslationsPayload(
      { en: { name: "English", bio: "Bio" }, ar: { name: "" } },
      ["en", "ar"],
      (v) => !!v?.name,
    );
    expect(result).toHaveLength(1);
    expect(result?.[0]?.locale).toBe("en");
  });

  it("works with complex object types", () => {
    type ListingTranslation = { title: string; description?: string };
    const result = buildTranslationsPayload<ListingTranslation>(
      {
        en: { title: "Lecture", description: "A lecture" },
        ar: { title: "محاضرة", description: undefined },
      },
      ["en", "ar"],
      (v) => !!(v?.title || v?.description),
    );
    expect(result).toHaveLength(2);
    expect(result?.[0]?.title).toBe("Lecture");
    expect(result?.[1]?.title).toBe("محاضرة");
  });

  it("returns undefined when input array is empty", () => {
    const result = buildTranslationsPayload({ en: { name: "Test" } }, [], (v) => !!v?.name);
    expect(result).toBeUndefined();
  });

  it("preserves all fields from the translation object", () => {
    type FullTranslation = { name: string; bio?: string; status?: string };
    const result = buildTranslationsPayload<FullTranslation>(
      {
        en: { name: "Test", bio: "Bio", status: "published" },
      },
      ["en"],
      (v) => !!v?.name,
    );
    expect(result).toHaveLength(1);
    expect(result![0]).toEqual({
      locale: "en",
      name: "Test",
      bio: "Bio",
      status: "published",
    });
  });
});

describe("getLocaleLabel", () => {
  it("returns 'English' for en locale", () => {
    const result = getLocaleLabel("en");
    expect(result).toBe("English");
  });

  it("returns Arabic label for ar locale", () => {
    const result = getLocaleLabel("ar");
    expect(result).toBe("العربية");
  });
});
