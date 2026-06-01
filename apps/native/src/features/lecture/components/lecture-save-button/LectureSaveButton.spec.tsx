import React from "react";
import renderer, { act } from "react-test-renderer";
import { useProgressStore } from "@sd/domain-audio";
import { LectureSaveButton } from "./LectureSaveButton";

jest.mock("../../../../shared/components/Button/Button", () => ({
  Button: ({ label, onPress }: { label: string; onPress: () => void }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react");
    return React.createElement("View", { testID: label, onPress }, label);
  },
}));

const initialState = useProgressStore.getState();
beforeEach(() => useProgressStore.setState(initialState, true));

describe("LectureSaveButton", () => {
  it('renders "Save" when lecture is not saved', () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<LectureSaveButton lectureId="lec-1" />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain("Save");
  });

  it('renders "✓ Saved" when lecture is saved', () => {
    useProgressStore.getState().actions.addSaved("lec-1");
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<LectureSaveButton lectureId="lec-1" />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain("✓ Saved");
  });

  it("calls addSaved when pressing Save", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<LectureSaveButton lectureId="lec-2" />);
    });
    const pressable = tree!.root.find(
      (node: { props: { onPress?: unknown } }) => typeof node.props.onPress === "function",
    );
    act(() => {
      pressable.props.onPress();
    });
    expect(useProgressStore.getState().actions.isSaved("lec-2")).toBe(true);
  });

  it("calls removeSaved when pressing Saved", () => {
    useProgressStore.getState().actions.addSaved("lec-3");
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<LectureSaveButton lectureId="lec-3" />);
    });
    const pressable = tree!.root.find(
      (node: { props: { onPress?: unknown } }) => typeof node.props.onPress === "function",
    );
    act(() => {
      pressable.props.onPress();
    });
    expect(useProgressStore.getState().actions.isSaved("lec-3")).toBe(false);
  });
});
