import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
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

jest.mock("@/core/i18n/i18n", () => ({
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

  it("shows the active locale and reveals the others when opened", async () => {
    await render(<LanguageSwitch />);

    // Closed: only the active locale label is shown.
    expect(screen.getByText("English")).toBeTruthy();
    expect(screen.queryByText("العربية")).toBeNull();

    // Open the menu.
    await fireEvent.press(screen.getByText("English"));

    expect(screen.getByText("العربية")).toBeTruthy();
  });

  it("changes locale when a locale option is pressed", async () => {
    await render(<LanguageSwitch />);

    // Open the menu, then pick the Arabic option.
    await fireEvent.press(screen.getByText("English"));
    await fireEvent.press(screen.getByText("العربية"));

    await waitFor(() => expect(changeLocale).toHaveBeenCalledWith("ar"));
  });
});
