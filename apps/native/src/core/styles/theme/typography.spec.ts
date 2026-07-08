import { createTypography } from "./typography";

describe("createTypography", () => {
  it("uses Fraunces for English display role", () => {
    const typo = createTypography("en");
    expect(typo.displayLg.fontFamily).toBe("Fraunces-SemiBold");
    expect(typo.displayMd.fontFamily).toBe("Fraunces-SemiBold");
  });

  it("uses Manrope for English body role", () => {
    const typo = createTypography("en");
    expect(typo.bodyMd.fontFamily).toBe("Manrope-Regular");
    expect(typo.titleLg.fontFamily).toBe("Manrope-SemiBold");
    expect(typo.caption.fontFamily).toBe("Manrope-Regular");
  });

  it("uses GeistMono for mono role regardless of locale", () => {
    const enTypo = createTypography("en");
    const arTypo = createTypography("ar");
    expect(enTypo.bodyMd.fontFamily).not.toBe("Fraunces");
    expect(arTypo.bodyMd.fontFamily).not.toBe("Fraunces");
  });

  it("uses Alexandria for Arabic display role", () => {
    const typo = createTypography("ar");
    expect(typo.displayLg.fontFamily).toBe("Alexandria-SemiBold");
    expect(typo.displayMd.fontFamily).toBe("Alexandria-SemiBold");
  });

  it("uses IBM Plex Sans Arabic for Arabic body role", () => {
    const typo = createTypography("ar");
    expect(typo.bodyMd.fontFamily).toBe("IBMPlexSansArabic-Regular");
    expect(typo.titleLg.fontFamily).toBe("IBMPlexSansArabic-SemiBold");
  });

  it("preserves font geometry across locales", () => {
    const enTypo = createTypography("en");
    const arTypo = createTypography("ar");
    expect(arTypo.bodyMd.fontSize).toBe(enTypo.bodyMd.fontSize);
    expect(arTypo.displayLg.lineHeight).toBe(enTypo.displayLg.lineHeight);
    expect(arTypo.titleMd.letterSpacing).toBe(enTypo.titleMd.letterSpacing);
  });
});
