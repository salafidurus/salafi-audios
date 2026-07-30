import { render, fireEvent, screen } from "@testing-library/react-native";

import { SegmentedControl } from "./SegmentedControl";

const options = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

describe("SegmentedControl", () => {
  it("renders every option label", async () => {
    await render(
      <SegmentedControl options={[...options]} value="system" onChange={() => undefined} />,
    );

    expect(screen.getByText("System")).toBeTruthy();
    expect(screen.getByText("Light")).toBeTruthy();
    expect(screen.getByText("Dark")).toBeTruthy();
  });

  it("calls onChange with the option's value when a segment is pressed", async () => {
    const onChange = jest.fn();
    await render(<SegmentedControl options={[...options]} value="system" onChange={onChange} />);

    await fireEvent.press(screen.getByText("Dark"));

    expect(onChange).toHaveBeenCalledWith("dark");
  });

  it("marks the current value's segment as selected", async () => {
    await render(
      <SegmentedControl options={[...options]} value="light" onChange={() => undefined} />,
    );

    expect(screen.getByText("Light").parent?.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByText("System").parent?.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });
});
