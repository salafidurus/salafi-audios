import { render, screen, fireEvent } from "@testing-library/react-native";
import { Text } from "react-native";

import { ListItem } from "./ListItem";
import { ListItemActions } from "./ListItemActions";

describe("ListItem", () => {
  it("uses the supported Expo UI ListItem row surface", async () => {
    await render(
      <ListItem testID="lecture-row">
        <Text>Row content</Text>
      </ListItem>,
    );

    expect(screen.getByTestId("lecture-row")).toBeTruthy();
  });

  it("calls onPress when tapped and renders no menu wiring without List.Item.Actions", async () => {
    const onPress = jest.fn();
    await render(
      <ListItem onPress={onPress}>
        <Text>Row content</Text>
      </ListItem>,
    );

    await fireEvent.press(screen.getByText("Row content"));

    expect(onPress).toHaveBeenCalled();
    expect(screen.queryByTestId(/-action-/)).toBeNull();
  });

  it("delegates row interaction and appearance to the universal item", async () => {
    const onPress = jest.fn();
    await render(
      <ListItem onPress={onPress} testID="lecture-row">
        <Text>Row content</Text>
      </ListItem>,
    );

    await fireEvent.press(screen.getByTestId("lecture-row"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("opens a long-press menu with the given List.Item.Actions and reports the pressed action", async () => {
    const onAction = jest.fn();
    await render(
      <ListItem testID="lecture-row">
        <Text>Row content</Text>
        <ListItemActions
          actions={[
            { id: "edit", title: "Edit" },
            { id: "delete", title: "Delete", attributes: { destructive: true } },
          ]}
          onAction={onAction}
        />
      </ListItem>,
    );

    await fireEvent.press(screen.getByTestId("lecture-row-action-delete"));

    expect(onAction).toHaveBeenCalledWith("delete");
  });

  it("does not render List.Item.Actions' marker as visible row content", async () => {
    await render(
      <ListItem testID="lecture-row">
        <Text>Row content</Text>
        <ListItemActions actions={[{ id: "edit", title: "Edit" }]} onAction={() => undefined} />
      </ListItem>,
    );

    expect(screen.getByText("Row content")).toBeTruthy();
    expect(screen.getByTestId("lecture-row-action-edit")).toBeTruthy();
  });

  it("still calls onPress when the row itself is tapped while actions are configured", async () => {
    const onPress = jest.fn();
    await render(
      <ListItem testID="lecture-row" onPress={onPress}>
        <Text>Row content</Text>
        <ListItemActions actions={[{ id: "edit", title: "Edit" }]} onAction={() => undefined} />
      </ListItem>,
    );

    await fireEvent.press(screen.getByText("Row content"));

    expect(onPress).toHaveBeenCalled();
  });
});
