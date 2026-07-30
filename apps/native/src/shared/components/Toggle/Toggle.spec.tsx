import { render, screen, fireEvent } from "@testing-library/react-native";

import { Toggle } from "./Toggle";

describe("Toggle", () => {
  it("reflects the checked state", async () => {
    await render(<Toggle checked onChange={() => undefined} />);

    expect(screen.getByTestId("toggle-switch").props.value).toBe(true);
  });

  it("calls onChange with the new value when toggled", async () => {
    const onChange = jest.fn();
    await render(<Toggle checked={false} onChange={onChange} />);

    fireEvent(screen.getByTestId("toggle-switch"), "valueChange", true);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("disables interaction when disabled", async () => {
    await render(<Toggle checked={false} onChange={() => undefined} disabled />);

    expect(screen.getByTestId("toggle-switch").props.disabled).toBe(true);
  });
});
