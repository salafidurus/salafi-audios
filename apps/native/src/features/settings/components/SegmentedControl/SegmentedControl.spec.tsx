import { render, fireEvent, screen } from "@testing-library/react-native";

import { SegmentedControl } from "./SegmentedControl";

const options = [
  { value: "system", label: "System" },
  { value: "parchment", label: "Parchment" },
  { value: "manuscript", label: "Manuscript" },
  { value: "midnight", label: "Midnight" },
  { value: "ember", label: "Ember" },
] as const;

const mockUseUnistyles = jest.fn();

// Overrides the global react-native-unistyles mock (jest.setup.js) so this
// spec can control `rt.themeName`, which the global mock always leaves `{}`.
// SegmentedControl only calls useUnistyles (no StyleSheet.create), so that's
// the only export this override needs to provide.
jest.mock("react-native-unistyles", () => ({
  useUnistyles: () => mockUseUnistyles(),
}));

describe("SegmentedControl", () => {
  beforeEach(() => {
    mockUseUnistyles.mockReturnValue({
      theme: { colors: { action: { primary: "#000" } } },
      rt: { themeName: "light" },
    });
  });

  it("passes the current theme name as the native appearance override", async () => {
    mockUseUnistyles.mockReturnValue({
      theme: { colors: { action: { primary: "#000" } } },
      rt: { themeName: "midnight" },
    });

    await render(
      <SegmentedControl options={[...options]} value="system" onChange={() => undefined} />,
    );

    expect(screen.getByTestId("native-segmented-control").props.appearance).toBe("dark");
  });

  it("renders every option label", async () => {
    await render(
      <SegmentedControl options={[...options]} value="system" onChange={() => undefined} />,
    );

    expect(screen.getByText("System")).toBeTruthy();
    expect(screen.getByText("Parchment")).toBeTruthy();
    expect(screen.getByText("Manuscript")).toBeTruthy();
    expect(screen.getByText("Midnight")).toBeTruthy();
    expect(screen.getByText("Ember")).toBeTruthy();
  });

  it("calls onChange with the option's value when a segment is pressed", async () => {
    const onChange = jest.fn();
    await render(<SegmentedControl options={[...options]} value="system" onChange={onChange} />);

    await fireEvent.press(screen.getByText("Midnight"));

    expect(onChange).toHaveBeenCalledWith("midnight");
  });

  it("marks the current value's segment as selected", async () => {
    await render(
      <SegmentedControl options={[...options]} value="parchment" onChange={() => undefined} />,
    );

    expect(screen.getByText("Parchment").parent?.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByText("System").parent?.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });
});
