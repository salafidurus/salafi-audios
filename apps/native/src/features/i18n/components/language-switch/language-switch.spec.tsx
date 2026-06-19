import React from "react";
import renderer, { act } from "react-test-renderer";
import { changeLocale } from "@/core/i18n/i18n";
import { LanguageSwitch } from "./language-switch";

const mockUseTranslation = jest.fn(() => ({
  i18n: { language: "en" },
}));

jest.mock("@sd/core-i18n", () => ({
  SUPPORTED_LOCALES: ["en", "ar"],
}));

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => mockUseTranslation(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn().mockResolvedValue(undefined) }),
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

function findPressables(tree: ReturnType<typeof renderer.create>) {
  return tree.root.findAll(
    (node: { props: { onPress?: unknown } }) => typeof node.props.onPress === "function",
  );
}

describe("LanguageSwitch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      i18n: { language: "en" },
    });
  });

  it("shows the active locale and reveals the others when opened", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<LanguageSwitch />);
    });

    // Closed: only the active locale label is shown.
    expect(JSON.stringify(tree!.toJSON())).toContain("English");
    expect(JSON.stringify(tree!.toJSON())).not.toContain("العربية");

    // Open the menu.
    act(() => {
      findPressables(tree!)[0]!.props.onPress();
    });

    expect(JSON.stringify(tree!.toJSON())).toContain("العربية");
  });

  it("changes locale when a locale option is pressed", async () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<LanguageSwitch />);
    });

    act(() => {
      findPressables(tree!)[0]!.props.onPress();
    });
    // After opening: [trigger, option en, option ar].
    await act(async () => {
      await findPressables(tree!)[2]!.props.onPress();
    });

    expect(changeLocale).toHaveBeenCalledWith("ar");
  });
});
