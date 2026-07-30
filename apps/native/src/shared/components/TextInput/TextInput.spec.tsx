import { render, screen, fireEvent } from "@testing-library/react-native";

import { TextInput } from "./TextInput";

describe("TextInput", () => {
  it("renders the current value", async () => {
    await render(<TextInput value="hello" onChangeText={() => undefined} testID="input" />);
    expect(screen.getByTestId("input").props.value).toBe("hello");
  });

  it("calls onChangeText as the user types", async () => {
    const onChangeText = jest.fn();
    await render(<TextInput value="" onChangeText={onChangeText} testID="input" />);

    fireEvent.changeText(screen.getByTestId("input"), "abc");

    expect(onChangeText).toHaveBeenCalledWith("abc");
  });

  it("reflects an externally-changed value prop (e.g. a Cancel/reset action)", async () => {
    const { rerender } = await render(
      <TextInput value="typed text" onChangeText={() => undefined} testID="input" />,
    );
    expect(screen.getByTestId("input").props.value).toBe("typed text");

    await rerender(<TextInput value="reset value" onChangeText={() => undefined} testID="input" />);

    expect(screen.getByTestId("input").props.value).toBe("reset value");
  });

  it("respects editable=false", async () => {
    await render(
      <TextInput value="locked" onChangeText={() => undefined} editable={false} testID="input" />,
    );
    expect(screen.getByTestId("input").props.editable).toBe(false);
  });
});
