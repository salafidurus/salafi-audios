import React from "react";
import renderer, { act } from "react-test-renderer";
import { changeLocale } from "../../../../core/i18n/i18n";
import { LanguageSwitch } from "./language-switch";

const mockUseTranslation = jest.fn(() => ({
  i18n: { language: "en" },
}));

jest.mock("@sd/core-i18n", () => ({
  SUPPORTED_LOCALES: ["en", "ar"],
  useTranslation: () => mockUseTranslation(),
}));

jest.mock("../../../../core/i18n/i18n", () => ({
  changeLocale: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (styles: (theme: unknown) => unknown) =>
      styles({
        spacing: {
          component: { gapSm: 8 },
          scale: { sm: 8, md: 12 },
        },
        radius: {
          component: { chip: 9999 },
        },
        colors: {
          border: { default: "#e5e5e5" },
          surface: { default: "#ffffff" },
          action: { primary: "#14b8a6" },
          content: { strong: "#111111", onPrimary: "#0d0d0d" },
        },
        typography: {
          labelMd: {},
        },
      }),
  },
}));

describe("LanguageSwitch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      i18n: { language: "en" },
    });
  });

  it("renders all supported locales", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<LanguageSwitch />);
    });
    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain("English");
    expect(rendered).toContain("العربية");
  });

  it("changes locale when a locale button is pressed", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<LanguageSwitch />);
    });
    // Find all pressables and press the one for Arabic (index 1)
    const pressables = tree!.root.findAll(
      (node: { props: { onPress?: unknown } }) => typeof node.props.onPress === "function",
    );
    act(() => {
      pressables[1].props.onPress();
    });
    expect(changeLocale).toHaveBeenCalledWith("ar");
  });
});
