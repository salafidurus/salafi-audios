import { render, screen } from "@testing-library/react-native";
import React from "react";

import { SettingsGeneralScreen } from "./settings-general.screen";

jest.mock("react-native-unistyles", () => {
  const { lightNativeTheme } = require("@/core/styles/theme");
  return {
    UnistylesRuntime: { hasAdaptiveThemes: true, themeName: "light" },
    useUnistyles: () => ({ theme: lightNativeTheme, rt: {} }),
  };
});

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

jest.mock("../components/language-switch/language-switch", () => ({
  LanguageSwitch: () => null,
}));

jest.mock("../components/content-language-toggle/content-language-toggle", () => ({
  ContentLanguageToggle: () => null,
}));

jest.mock("@/shared/ui", () => {
  const actual = jest.requireActual<typeof import("@/shared/ui")>("@/shared/ui");
  return { ...actual, NativeSegmentedControl: () => null };
});

describe("SettingsGeneralScreen", () => {
  it("uses the shared Expo UI screen host", async () => {
    await render(<SettingsGeneralScreen />);

    expect(screen.getByTestId("settings-general-host")).toBeTruthy();
  });
});
