import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi } from "bun:test";

import { FilterSelect } from "./filter-select";

const options = [
  { id: "ibn-baz", label: "Ibn Baz" },
  { id: "al-albani", label: "Al-Albani" },
];

function openMenu() {
  fireEvent.click(screen.getByRole("combobox"));
  return screen.getByRole("listbox");
}

describe("FilterSelect", () => {
  it("renders the filter label", () => {
    render(<FilterSelect label="Scholar" options={options} value="" onChange={() => {}} />);

    expect(screen.getByText("Scholar")).toBeInTheDocument();
  });

  it("renders options inside the dropdown menu", () => {
    render(<FilterSelect label="Scholar" options={options} value="" onChange={() => {}} />);

    const listbox = openMenu();

    expect(within(listbox).getByText("All")).toBeInTheDocument();
    expect(within(listbox).getByText("Ibn Baz")).toBeInTheDocument();
    expect(within(listbox).getByText("Al-Albani")).toBeInTheDocument();
  });

  it("calls onChange with the selected option id", () => {
    const handleChange = vi.fn();
    render(<FilterSelect label="Scholar" options={options} value="" onChange={handleChange} />);

    const listbox = openMenu();
    fireEvent.click(within(listbox).getByText("Ibn Baz"));

    expect(handleChange).toHaveBeenCalledWith("ibn-baz");
  });

  it("calls onChange with an empty string when All is selected", () => {
    const handleChange = vi.fn();
    render(
      <FilterSelect label="Scholar" options={options} value="ibn-baz" onChange={handleChange} />,
    );

    const listbox = openMenu();
    fireEvent.click(within(listbox).getByText("All"));

    expect(handleChange).toHaveBeenCalledWith("");
  });

  it("shows the selected option label in the trigger", () => {
    render(
      <FilterSelect label="Scholar" options={options} value="al-albani" onChange={() => {}} />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Al-Albani");
  });

  it("shows the All label when no option is selected", () => {
    render(<FilterSelect label="Scholar" options={options} value="" onChange={() => {}} />);

    expect(screen.getByRole("combobox")).toHaveTextContent("All");
  });

  it("renders a search input when searchable is true", () => {
    render(
      <FilterSelect label="Scholar" options={options} value="" onChange={() => {}} searchable />,
    );

    openMenu();

    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });
});
