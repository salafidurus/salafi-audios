import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("renders with placeholder", () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Search scholars..." />);
    expect(screen.getByPlaceholderText("Search scholars...")).toBeInTheDocument();
  });

  it("calls onChange as user types", () => {
    const handleChange = jest.fn();
    render(<SearchBar value="" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test" } });

    expect(handleChange).toHaveBeenCalledWith("test");
  });

  it("shows clear button when value is not empty", () => {
    const { rerender } = render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();

    rerender(<SearchBar value="test" onChange={() => {}} />);
    expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
  });

  it("clears input when clear button clicked", () => {
    const handleChange = jest.fn();
    const handleClear = jest.fn();

    render(<SearchBar value="test" onChange={handleChange} onClear={handleClear} />);

    const clearButton = screen.getByLabelText("Clear search");
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith("");
    expect(handleClear).toHaveBeenCalled();
  });

  it("renders filter slot when provided", () => {
    render(
      <SearchBar
        value=""
        onChange={() => {}}
        filters={<div data-testid="filter">Status Filter</div>}
      />,
    );
    expect(screen.getByTestId("filter")).toBeInTheDocument();
  });
});
