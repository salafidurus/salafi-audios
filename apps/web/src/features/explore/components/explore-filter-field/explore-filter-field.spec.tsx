import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "bun:test";

import { ExploreFilterField } from "./explore-filter-field";

const options = [
  { id: "ibn-baz", label: "Ibn Baz" },
  { id: "al-albani", label: "Al-Albani" },
];

const defaultProps = {
  id: "explore-scholar",
  label: "Scholar",
  options,
  value: "",
  allLabel: "All",
  searchPlaceholder: "Search scholars",
  emptyLabel: "No scholars found",
  onChange: vi.fn(),
};

describe("ExploreFilterField", () => {
  it("associates the visible label with a standard Select control", () => {
    render(<ExploreFilterField {...defaultProps} mode="select" />);

    expect(screen.getByLabelText("Scholar: All")).toBeInTheDocument();
  });

  it("renders a searchable Combobox with its localized empty state", () => {
    render(<ExploreFilterField {...defaultProps} mode="combobox" />);

    const input = screen.getByRole("combobox", { name: "Scholar" });
    expect(input).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    fireEvent.change(input, { target: { value: "missing" } });
    expect(screen.getByText("No scholars found")).toBeInTheDocument();
  });

  it("emits the selected Combobox option id", () => {
    const onChange = vi.fn();
    render(<ExploreFilterField {...defaultProps} mode="combobox" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("option", { name: "Ibn Baz" }));

    expect(onChange).toHaveBeenCalledWith("ibn-baz");
  });

  it("emits an empty value when All is selected", () => {
    const onChange = vi.fn();
    render(
      <ExploreFilterField {...defaultProps} value="ibn-baz" mode="select" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Scholar: Ibn Baz" }));
    fireEvent.click(screen.getByRole("option", { name: "All" }));

    expect(onChange).toHaveBeenCalledWith("");
  });
});
