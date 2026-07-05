import React from "react";
import { render, screen } from "@testing-library/react-native";
import { View } from "react-native";
import { ScreenView } from "./ScreenView";

jest.mock("react-native-safe-area-context", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaView: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
  };
});

describe("ScreenView", () => {
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
