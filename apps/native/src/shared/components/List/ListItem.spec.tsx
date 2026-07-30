import { render, screen, fireEvent } from "@testing-library/react-native";
import { Text } from "react-native";

import { ListItem } from "./ListItem";

describe("ListItem", () => {
  it("calls onPress when tapped and renders no menu wiring without actions", async () => {
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

  it("opens a long-press menu with the given actions and reports the pressed action", async () => {
    const onAction = jest.fn();
    await render(
      <ListItem
        testID="lecture-row"
        actions={[
          { id: "edit", title: "Edit" },
          { id: "delete", title: "Delete", attributes: { destructive: true } },
        ]}
        onAction={onAction}
      >
        <Text>Row content</Text>
      </ListItem>,
    );

    await fireEvent.press(screen.getByTestId("lecture-row-action-delete"));

    expect(onAction).toHaveBeenCalledWith("delete");
  });

  it("still calls onPress when the row itself is tapped while actions are configured", async () => {
    const onPress = jest.fn();
    await render(
      <ListItem testID="lecture-row" onPress={onPress} actions={[{ id: "edit", title: "Edit" }]}>
        <Text>Row content</Text>
      </ListItem>,
    );

    await fireEvent.press(screen.getByText("Row content"));

    expect(onPress).toHaveBeenCalled();
  });
});
