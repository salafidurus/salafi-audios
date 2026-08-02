import { useQueryClient } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";

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

  it("shows the active locale as the menu trigger", async () => {
    await render(<LanguageSwitch />);

    expect(screen.getAllByText("English").length).toBeGreaterThan(0);
  });

  it("marks the active locale's menu action as selected, and others as not", async () => {
    await render(<LanguageSwitch />);

    expect(screen.getByTestId("language-switch-menu-action-en").props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );
    expect(screen.getByTestId("language-switch-menu-action-ar").props.accessibilityState).toEqual(
      expect.objectContaining({ checked: false }),
    );
  });

  it("changes locale when the other locale's menu action is pressed", async () => {
    await render(<LanguageSwitch />);

    await fireEvent.press(screen.getByTestId("language-switch-menu-action-ar"));

    await waitFor(() => expect(changeLocale).toHaveBeenCalledWith("ar"));
  });

  it("does not call changeLocale when the already-active locale is pressed", async () => {
    await render(<LanguageSwitch />);

    await fireEvent.press(screen.getByTestId("language-switch-menu-action-en"));

    expect(changeLocale).not.toHaveBeenCalled();
  });

  it("clears the query cache, switches locale, then invalidates queries to refetch under the new locale", async () => {
    await render(<LanguageSwitch />);
    const mockQueryClient = useQueryClient();

    await fireEvent.press(screen.getByTestId("language-switch-menu-action-ar"));

    await waitFor(() => expect(changeLocale).toHaveBeenCalledWith("ar"));
    expect(mockQueryClient.clear).toHaveBeenCalled();
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
  });
});
