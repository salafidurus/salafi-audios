import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { useProgressStore } from "@sd/domain-audio";
import { LectureSaveButton } from "./LectureSaveButton";

jest.mock("../../../../shared/components/Button/Button", () => ({
  Button: ({ label, onPress }: { label: string; onPress: () => void }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return React.createElement(
      "View",
      { testID: label, onPress },
      React.createElement(Text, null, label),
    );
  },
}));

const initialState = useProgressStore.getState();
beforeEach(() => useProgressStore.setState(initialState, true));

describe("LectureSaveButton", () => {
  it('renders "Save" when lecture is not saved', async () => {
    await render(<LectureSaveButton lectureId="lec-1" />);
    expect(screen.getByTestId("Save")).toBeTruthy();
  });

  it('renders "✓ Saved" when lecture is saved', async () => {
    useProgressStore.getState().actions.addSaved("lec-1");
    await render(<LectureSaveButton lectureId="lec-1" />);
    expect(screen.getByTestId("✓ Saved")).toBeTruthy();
  });

  it("calls addSaved when pressing Save", async () => {
    await render(<LectureSaveButton lectureId="lec-2" />);
    await fireEvent.press(screen.getByTestId("Save"));
    expect(useProgressStore.getState().actions.isSaved("lec-2")).toBe(true);
  });

  it("calls removeSaved when pressing Saved", async () => {
    useProgressStore.getState().actions.addSaved("lec-3");
    await render(<LectureSaveButton lectureId="lec-3" />);
    await fireEvent.press(screen.getByTestId("✓ Saved"));
    expect(useProgressStore.getState().actions.isSaved("lec-3")).toBe(false);
  });
});
