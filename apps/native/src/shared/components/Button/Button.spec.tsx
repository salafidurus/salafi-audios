import React from "react";
import { View } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";

jest.mock("react-native-svg", () => ({
  Svg: "Svg",
  Defs: "Defs",
  LinearGradient: "LinearGradient",
  RadialGradient: "RadialGradient",
  Rect: "Rect",
  Stop: "Stop",
}));

jest.mock("react-native-ease", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    EaseView: ({ children, style }: { children: React.ReactNode; style?: object }) =>
      React.createElement(View, { style }, children),
  };
});

jest.mock("../AccentGradientFill/AccentGradientFill", () => ({
  AccentGradientFill: () => null,
}));

import { Button } from "./Button";

describe("Button", () => {
  it("renders label text", async () => {
    await render(<Button label="Submit" />);
    expect(screen.getByText("Submit")).toBeTruthy();
  });

  it("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    await render(<Button label="Submit" onPress={onPress} />);
    await fireEvent.press(screen.getByText("Submit"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows loading indicator instead of label when loading", async () => {
    await render(<Button label="Submit" loading />);
    expect(screen.queryByText("Submit")).toBeNull();
  });

  it("does not call onPress when disabled", async () => {
    const onPress = jest.fn();
    await render(<Button label="Submit" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByText("Submit"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders with fullWidth style", async () => {
    await render(<Button label="Submit" fullWidth />);
    expect(screen.getByText("Submit")).toBeTruthy();
  });

  it("renders icon on the left by default", async () => {
    await render(<Button label="Submit" icon={<View testID="test-icon" />} />);
    expect(screen.getByTestId("test-icon")).toBeTruthy();
  });
});
