import { render, screen } from "@testing-library/react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ScreenView } from "./ScreenView";

jest.mock("react-native-safe-area-context", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    useSafeAreaInsets: () => mockInsets,
    SafeAreaView: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
  };
});

let mockInsets: { top: number; bottom: number; left: number; right: number } = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

describe("ScreenView", () => {
  it("applies the top safe-area inset by default", async () => {
    mockInsets = { top: 59, bottom: 0, left: 0, right: 0 };
    await render(
      <ScreenView>
        <View testID="child" />
      </ScreenView>,
    );
    const containerStyle = StyleSheet.flatten(
      screen.getByTestId("screen-view-container").props.style,
    );
    expect(containerStyle.paddingTop).toBe(59);
  });

  it("omits the top inset when includeTopInset is false", async () => {
    mockInsets = { top: 59, bottom: 0, left: 0, right: 0 };
    await render(
      <ScreenView includeTopInset={false}>
        <View testID="child" />
      </ScreenView>,
    );
    const containerStyle = StyleSheet.flatten(
      screen.getByTestId("screen-view-container").props.style,
    );
    expect(containerStyle.paddingTop).toBeUndefined();
  });
  it("renders children", async () => {
    await render(
      <ScreenView>
        <View testID="child" />
      </ScreenView>,
    );
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("centers content when center is true", async () => {
    await render(
      <ScreenView center>
        <View testID="child" />
      </ScreenView>,
    );
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("accepts custom style", async () => {
    await render(
      <ScreenView style={{ marginTop: 10 }}>
        <View testID="child" />
      </ScreenView>,
    );
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("renders with canvas background by default", async () => {
    await render(
      <ScreenView>
        <View testID="child" />
      </ScreenView>,
    );
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("renders with primaryWash background", async () => {
    await render(
      <ScreenView backgroundVariant="primaryWash">
        <View testID="child" />
      </ScreenView>,
    );
    expect(screen.getByTestId("child")).toBeTruthy();
  });
});
