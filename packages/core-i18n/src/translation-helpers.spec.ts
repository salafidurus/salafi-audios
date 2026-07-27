import { getLocalizedName, getScholarTitleLabel, getSubnavLabel } from "./translation-helpers";

describe("getLocalizedName", () => {
  it("returns empty string for null or undefined", () => {
    expect(getLocalizedName(null, "en")).toBe("");
    expect(getLocalizedName(undefined, "ar")).toBe("");
  });

  it("returns string as-is when input is a string", () => {
    expect(getLocalizedName("Fiqh", "en")).toBe("Fiqh");
    expect(getLocalizedName("الفقه", "ar")).toBe("الفقه");
  });

  it("returns Arabic translation when locale is ar and ar translation exists", () => {
    expect(getLocalizedName({ en: "Aqeedah", ar: "العقيدة" }, "ar")).toBe("العقيدة");
  });

  it("falls back to English when locale is ar but ar translation is missing", () => {
    expect(getLocalizedName({ en: "Aqeedah" }, "ar")).toBe("Aqeedah");
    expect(getLocalizedName({ en: "Aqeedah", ar: "" }, "ar")).toBe("Aqeedah");
  });

  it("returns English translation when locale is en", () => {
    expect(getLocalizedName({ en: "Aqeedah", ar: "العقيدة" }, "en")).toBe("Aqeedah");
  });

  it("accepts an ar-required/en-optional shape (e.g. Topic, whose main language is Arabic)", () => {
    expect(getLocalizedName({ ar: "العقيدة" }, "ar")).toBe("العقيدة");
    // Falls back to Arabic when locale is en but no English translation exists yet.
    expect(getLocalizedName({ ar: "العقيدة" }, "en")).toBe("العقيدة");
    expect(getLocalizedName({ ar: "العقيدة", en: "Aqeedah" }, "en")).toBe("Aqeedah");
  });
});

describe("getScholarTitleLabel", () => {
  const t = (key: string) =>
    ({
      "scholar.title.allamah": "Shaykh Allamah",
      "scholar.title.sheikh": "Sheikh",
      "scholar.title.ustadh": "Ustadh",
      "scholar.title.akh": "Akh",
    })[key] ?? key;

  it("resolves each known ScholarTitle to its translated label via the injected t function", () => {
    expect(getScholarTitleLabel("allamah", t)).toBe("Shaykh Allamah");
    expect(getScholarTitleLabel("sheikh", t)).toBe("Sheikh");
    expect(getScholarTitleLabel("ustadh", t)).toBe("Ustadh");
    expect(getScholarTitleLabel("akh", t)).toBe("Akh");
  });

  it("falls back to the raw value for an unmapped or missing title", () => {
    expect(getScholarTitleLabel(undefined, t)).toBe("");
    expect(getScholarTitleLabel(null, t)).toBe("");
    expect(getScholarTitleLabel("not-a-real-title", t)).toBe("not-a-real-title");
  });

  it("actually calls the injected t function rather than returning a hardcoded string", () => {
    const arabicT = (key: string) => ({ "scholar.title.sheikh": "الشيخ" })[key] ?? key;
    expect(getScholarTitleLabel("sheikh", arabicT)).toBe("الشيخ");
  });
});
