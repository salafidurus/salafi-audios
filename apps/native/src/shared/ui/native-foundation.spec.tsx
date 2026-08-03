import { fireEvent, render, screen } from "@testing-library/react-native";

import { NativeButton } from "./native-button";
import { NativeFormField } from "./native-form-field";
import { NativeList, NativeListItem } from "./native-list";
import { NativeStateView } from "./native-state-view";
import { NativeText } from "./native-text";

describe("Expo UI foundation", () => {
  it("renders design-token typography through Expo UI Text", async () => {
    await render(
      <NativeText variant="titleMd" colorRole="strong" testID="heading">
        Recent lessons
      </NativeText>,
    );

    expect(screen.getByTestId("heading")).toHaveTextContent("Recent lessons");
    expect(screen.getByTestId("heading").props.textStyle).toMatchObject({
      fontSize: expect.any(Number),
      fontFamily: expect.any(String),
      color: expect.any(String),
    });
  });

  it("renders an accessible token-aware button without creating a host", async () => {
    const onPress = jest.fn();
    await render(
      <NativeButton label="Add scholar" icon="add" onPress={onPress} testID="add-scholar" />,
    );

    await fireEvent.press(screen.getByTestId("add-scholar"));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Add scholar" })).toBeTruthy();
    expect(screen.queryByTestId("nested-host")).toBeNull();
  });

  it("composes native list rows and delegates pull-to-refresh", async () => {
    const onPress = jest.fn();
    const onRefresh = jest.fn().mockResolvedValue(undefined);
    await render(
      <NativeList onRefresh={onRefresh} testID="results">
        <NativeListItem
          title="Shaykh Ibn Baz"
          supportingText="12 lessons"
          leadingIcon="play"
          onPress={onPress}
          testID="scholar-row"
        />
      </NativeList>,
    );

    await fireEvent.press(screen.getByTestId("scholar-row"));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("results").props.onRefresh).toBe(onRefresh);
    expect(screen.getByText("12 lessons")).toBeTruthy();
  });

  it("provides consistent empty and error actions", async () => {
    const onAction = jest.fn();
    const view = await render(
      <NativeStateView
        kind="error"
        title="Could not load scholars"
        message="Check your connection and try again."
        actionLabel="Try again"
        onAction={onAction}
      />,
    );

    await fireEvent.press(view.getByRole("button", { name: "Try again" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(view.getByText("Could not load scholars")).toBeTruthy();
  });

  it("keeps Expo UI text input state synchronized with a controlled value", async () => {
    const onChangeText = jest.fn();
    const view = await render(
      <NativeFormField
        label="Title"
        value="Initial"
        onChangeText={onChangeText}
        helperText="Use the public title"
        testID="title-input"
      />,
    );

    await fireEvent.changeText(view.getByTestId("title-input"), "Updated");
    expect(onChangeText).toHaveBeenCalledWith("Updated");

    await view.rerender(
      <NativeFormField
        label="Title"
        value="Server value"
        onChangeText={onChangeText}
        error="A title is required"
        testID="title-input"
      />,
    );
    expect(view.getByDisplayValue("Server value")).toBeTruthy();
    expect(view.getByText("A title is required")).toBeTruthy();
  });
});
