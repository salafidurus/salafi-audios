import { createUniversalHostProps, toUniversalStyle, toUniversalTextStyle } from "./expo-ui";
import { darkNativeTheme, lightNativeTheme } from "./theme";

describe("Expo UI style boundary", () => {
  it("maps supported native surface values to UniversalStyle", () => {
    expect(
      toUniversalStyle({
        backgroundColor: lightNativeTheme.colors.surface.default,
        borderColor: lightNativeTheme.colors.border.default,
        borderRadius: lightNativeTheme.radius.component.card,
        padding: lightNativeTheme.spacing.component.cardPadding,
      }),
    ).toEqual({
      backgroundColor: "#FFFFFF",
      borderColor: lightNativeTheme.colors.border.default,
      borderRadius: 14,
      padding: 16,
    });
  });

  it("maps native typography separately from container styles", () => {
    expect(
      toUniversalTextStyle(lightNativeTheme, "bodyMd", lightNativeTheme.colors.content.default),
    ).toEqual({
      fontFamily: "Manrope-Regular",
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 24,
      letterSpacing: 0,
      color: lightNativeTheme.colors.content.default,
    });
  });

  it("maps locale direction and only resolved explicit color schemes", () => {
    expect(createUniversalHostProps(lightNativeTheme, "system")).toEqual({
      layoutDirection: "leftToRight",
      ignoreSafeArea: "all",
    });
    expect(createUniversalHostProps({ ...darkNativeTheme, direction: "rtl" }, "dark")).toEqual({
      colorScheme: "dark",
      layoutDirection: "rightToLeft",
      ignoreSafeArea: "all",
    });
  });

  it("does not accept unsupported React Native layout properties", () => {
    // @ts-expect-error flex belongs to the Host/layout boundary, not UniversalStyle.
    toUniversalStyle({ flex: 1 });
    // @ts-expect-error margin belongs to the Host/layout boundary, not UniversalStyle.
    toUniversalStyle({ margin: 8 });
  });
});
