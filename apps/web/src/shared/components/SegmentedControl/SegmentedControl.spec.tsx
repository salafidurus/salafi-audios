import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SegmentedControl } from "./SegmentedControl";

const OPTIONS = [
  { value: "system" as const, label: "System" },
  { value: "light" as const, label: "Light" },
  { value: "dark" as const, label: "Dark" },
];

describe("SegmentedControl", () => {
  it("renders all options", () => {
    render(<SegmentedControl options={OPTIONS} value="system" onChange={vi.fn<any>()} />);
    expect(screen.getByRole("button", { name: "System" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Light" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dark" })).toBeInTheDocument();
  });

  it("marks the selected option as pressed", () => {
    render(<SegmentedControl options={OPTIONS} value="light" onChange={vi.fn<any>()} />);
    expect(screen.getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "System" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange with the new value when a segment is clicked", () => {
    const handleChange = vi.fn<any>();
    render(<SegmentedControl options={OPTIONS} value="system" onChange={handleChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(handleChange).toHaveBeenCalledWith("dark");
  });

  it("applies ariaLabel to the group", () => {
    render(
      <SegmentedControl
        options={OPTIONS}
        value="system"
        onChange={vi.fn<any>()}
        ariaLabel="Theme preference"
      />,
    );
    expect(screen.getByRole("group", { name: "Theme preference" })).toBeInTheDocument();
  });
});
