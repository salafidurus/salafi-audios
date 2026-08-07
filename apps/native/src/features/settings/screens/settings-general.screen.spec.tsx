import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { UnistylesRuntime } from "react-native-unistyles";

import { SettingsGeneralScreen } from "./settings-general.screen";

jest.mock("react-native-unistyles", () => {
  const { lightNativeTheme } = require("../../../core/styles/theme");
  return {
    StyleSheet: {
      create: (styles: any) =>
        typeof styles === "function" ? styles(lightNativeTheme, {}) : styles,
      configure: jest.fn(),
    },
    useUnistyles: () => ({
      theme: lightNativeTheme,
      rt: {},
    }),
    UnistylesRuntime: {
      themeName: "system",
      setTheme: jest.fn(),
    },
  };
});

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

jest.mock("../components/content-language-toggle/content-language-toggle", () => ({
  ContentLanguageToggle: () => null,
}));

jest.mock("../components/language-switch/language-switch", () => ({
  LanguageSwitch: () => null,
}));

describe("SettingsGeneralScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders theme cards options instead of segmented control", async () => {
    await render(<SettingsGeneralScreen />);

    // The system (OS-follow) preference is surfaced as a settings row description
    expect(screen.getByText("System follows your OS preference")).toBeTruthy();

    // Check that we render the horizontal cards options
    expect(screen.getByText("Parchment")).toBeTruthy();
    expect(screen.getByText("Manuscript")).toBeTruthy();
    expect(screen.getByText("Midnight")).toBeTruthy();
    expect(screen.getByText("Ember")).toBeTruthy();
  });

  it("calls UnistylesRuntime.setTheme when a theme card is clicked", async () => {
    await render(<SettingsGeneralScreen />);

    const parchmentCard = screen.getByText("Parchment");
    fireEvent.press(parchmentCard);

    expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("parchment");
  });
});
