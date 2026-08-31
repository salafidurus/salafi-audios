import { fireEvent, render, screen } from "@testing-library/react-native";

import { NativeButton } from "./native-button";
import { NativeFormField } from "./native-form-field";
import { NativeIcon } from "./native-icon";
import { NativeList, NativeListItem } from "./native-list";
import { NativeStateView } from "./native-state-view";
import { NativeText } from "./native-text";
import { NativeBridgeHost, NativeScreenHost } from "./native-ui-host";

describe("native UI foundation", () => {
  it("renders token-aware semantic text", async () => {
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

  it("preserves button action and accessibility without a leaf host", async () => {
    const onPress = jest.fn();
    await render(<NativeButton label="Add scholar" onPress={onPress} testID="add-scholar" />);

    await fireEvent.press(screen.getByTestId("add-scholar"));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Add scholar" })).toBeTruthy();
  });

  it("synchronizes controlled form values and reports validation", async () => {
    const onChangeText = jest.fn();
    const view = await render(
      <NativeFormField
        label="Title"
        value="Initial"
        onChangeText={onChangeText}
        testID="title-input"
      />,
    );

    await fireEvent.changeText(view.getByTestId("title-input"), "Updated");
    expect(onChangeText).toHaveBeenCalledWith("Updated");

    await view.rerender(
      <NativeFormField
        label="Title"
        value="Server value"
        error="A title is required"
        onChangeText={onChangeText}
        testID="title-input"
      />,
    );
    expect(view.getByDisplayValue("Server value")).toBeTruthy();
    expect(view.getByText("A title is required")).toBeTruthy();
  });

  it("provides recoverable state actions", async () => {
    const onAction = jest.fn();
    const view = await render(
      <NativeStateView
        kind="error"
        title="Could not load scholars"
        actionLabel="Try again"
        onAction={onAction}
      />,
    );

    await fireEvent.press(view.getByRole("button", { name: "Try again" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("composes a semantic native list row", async () => {
    const onPress = jest.fn();
    await render(
      <NativeList testID="results">
        <NativeListItem
          title="Shaykh Ibn Baz"
          supportingText="12 lessons"
          onPress={onPress}
          testID="scholar-row"
        />
      </NativeList>,
    );

    await fireEvent.press(screen.getByTestId("scholar-row"));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText("12 lessons")).toBeTruthy();
  });

  it("exposes a platform-independent icon name and semantic color", async () => {
    await render(<NativeIcon name="play" colorRole="primary" testID="play-icon" size={24} />);

    expect(screen.getByTestId("play-icon").props).toMatchObject({ size: 24 });
  });

  it("owns host configuration at the screen boundary", async () => {
    await render(
      <NativeScreenHost testID="screen-host">
        <NativeText>Content</NativeText>
      </NativeScreenHost>,
    );

    expect(screen.getByTestId("screen-host").props).toMatchObject({
      layoutDirection: "leftToRight",
      useViewportSizeMeasurement: true,
    });
  });

  it("uses RNHostView only for an explicitly bridged RN child", async () => {
    await render(
      <NativeBridgeHost>
        <NativeText testID="bridged-content">Bridged content</NativeText>
      </NativeBridgeHost>,
    );

    expect(screen.getByTestId("rn-host-view")).toContainElement(
      screen.getByTestId("bridged-content"),
    );
  });
});
