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

jest.mock("@expo/ui", () => {
  const { Text, View } = require("react-native");
  const Container = ({ children, testID }: { children?: React.ReactNode; testID?: string }) => (
    <View testID={testID}>{children}</View>
  );
  const Picker = Object.assign(Container, { Item: () => null });

  return {
    Column: Container,
    Host: Container,
    Picker,
    Row: Container,
    ScrollView: Container,
    Switch: Container,
    Text,
  };
});

jest.mock("../components/language-switch/language-switch", () => ({
  LanguageSwitch: () => null,
}));

jest.mock("../components/content-language-toggle/content-language-toggle", () => ({
  ContentLanguageToggle: () => null,
}));

jest.mock("../components/SegmentedControl/SegmentedControl", () => ({
  SegmentedControl: ({
    options,
    ariaLabel,
  }: {
    options: Array<{ label: string }>;
    ariaLabel?: string;
  }) => {
    const { Text, View } = require("react-native");
    return (
      <View testID="theme-segmented-control" accessibilityLabel={ariaLabel}>
        {options.map((opt) => (
          <Text key={opt.label}>{opt.label}</Text>
        ))}
      </View>
    );
  },
}));

jest.mock("@/shared/ui", () => {
  const actual = jest.requireActual<typeof import("@/shared/ui")>("@/shared/ui");
  return { ...actual, NativeSegmentedControl: () => null };
});

describe("SettingsGeneralScreen", () => {
  it("uses the shared Expo UI screen host and SegmentedControl for theme preference", async () => {
    await render(<SettingsGeneralScreen />);

    expect(screen.getByTestId("settings-general-host")).toBeTruthy();
    expect(screen.getByTestId("theme-segmented-control")).toBeTruthy();
    expect(screen.getByText("System")).toBeTruthy();
    expect(screen.getByText("Light")).toBeTruthy();
    expect(screen.getByText("Dark")).toBeTruthy();
  });
});
