import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";
import { View } from "react-native";

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

  it("shows loading indicator instead of label and disables interaction", async () => {
    const onPress = jest.fn();
    await render(<Button label="Submit" loading onPress={onPress} />);
    expect(screen.queryByText("Submit")).toBeNull();
    await fireEvent.press(screen.getByRole("button"));
    expect(onPress).not.toHaveBeenCalled();
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

  it("maps the outline variant to the universal Expo UI button variant", async () => {
    await render(<Button label="Submit" variant="outline" testID="submit-button" />);
    expect(screen.getByTestId("submit-button").props.variant).toBe("outlined");
  });

  it("renders icons on the requested side", async () => {
    await render(<Button label="Submit" icon={<View testID="test-icon" />} iconPosition="right" />);
    expect(screen.getByTestId("test-icon")).toBeTruthy();
  });
});
