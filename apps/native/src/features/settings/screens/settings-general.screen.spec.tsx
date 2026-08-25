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

  it("renders exactly the system, light, and dark theme options", async () => {
    await render(<SettingsGeneralScreen />);

    expect(screen.getByText("System")).toBeTruthy();
    expect(screen.getByText("Light")).toBeTruthy();
    expect(screen.getByText("Dark")).toBeTruthy();
    expect(screen.queryByText("Parchment")).toBeNull();
    expect(screen.queryByText("Manuscript")).toBeNull();
    expect(screen.queryByText("Midnight")).toBeNull();
    expect(screen.queryByText("Ember")).toBeNull();
  });

  it("calls UnistylesRuntime.setTheme when a theme card is clicked", async () => {
    await render(<SettingsGeneralScreen />);

    const darkCard = screen.getByText("Dark");
    fireEvent.press(darkCard);

    expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("dark");
  });
});
