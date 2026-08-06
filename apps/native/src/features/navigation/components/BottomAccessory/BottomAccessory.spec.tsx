import { render, screen } from "@testing-library/react-native";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { BottomAccessoryParent } from "./BottomAccessory";

jest.mock("expo-audio", () => ({}));
jest.mock("expo-bottom-accessory", () => {
  const React = require("react");
  const { View: RNView } = require("react-native");
  return {
    ExpoBottomAccessoryView: ({
      children,
      testID,
      ...rest
    }: {
      children: React.ReactNode;
      testID?: string;
    }) =>
      React.createElement(
        RNView,
        { ...rest, testID: testID ?? "expo-bottom-accessory-view" },
        children,
      ),
  };
});

jest.mock("@sd/domain-audio", () => ({
  ...jest.requireActual("@sd/domain-audio"),
  useAudio: jest.fn(),
}));

jest.mock("@sd/domain-content", () => ({
  useFormattedScholarName: (scholarName: string) => scholarName,
}));

jest.mock("expo-router", () => ({
  usePathname: jest.fn(),
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

jest.mock("expo-image", () => ({
  Image: "Image",
}));

jest.mock("lucide-react-native", () => ({
  Play: "Play",
  Pause: "Pause",
  ChevronDown: "ChevronDown",
  Music: "Music",
  Layers: "Layers",
  Cloud: "Cloud",
}));

let mockInsetsBottom = 0;
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: "SafeAreaView",
  useSafeAreaInsets: () => ({ bottom: mockInsetsBottom }),
}));

const { useAudio } = jest.requireMock("@sd/domain-audio");
const { usePathname } = jest.requireMock("expo-router");

describe("BottomAccessoryParent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAudio.mockReturnValue({ currentTrack: null });
    usePathname.mockReturnValue("/recent");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("positions the JS fallback above the Android tab bar height plus a gap", async () => {
    mockInsetsBottom = 0;

    await render(
      <BottomAccessoryParent>
        <View testID="child" />
      </BottomAccessoryParent>,
    );

    const containerStyle = StyleSheet.flatten(screen.getByTestId("child").parent!.props.style);
    // 80 (Android tab bar) + 8 (minimum gap) — never below the tab bar top edge
    expect(containerStyle.bottom).toBeGreaterThanOrEqual(80);
    expect(containerStyle.bottom).toBe(88);
  });

  it("adds the bottom safe-area inset so the fallback never overlaps content", async () => {
    mockInsetsBottom = 24;

    await render(
      <BottomAccessoryParent>
        <View testID="child" />
      </BottomAccessoryParent>,
    );

    const containerStyle = StyleSheet.flatten(screen.getByTestId("child").parent!.props.style);
    expect(containerStyle.bottom).toBe(104);
  });

  it("hosts the accessory in the native view with positive offset padding on Android", async () => {
    jest.replaceProperty(Platform, "OS", "android");

    await render(
      <BottomAccessoryParent>
        <View testID="child" />
      </BottomAccessoryParent>,
    );

    const nativeView = screen.getByTestId("expo-bottom-accessory-view");
    expect(nativeView.props.offsetPadding).toBeGreaterThan(0);
    expect(screen.getByTestId("child")).toBeTruthy();
  });
});
