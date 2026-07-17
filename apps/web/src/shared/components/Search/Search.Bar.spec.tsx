import { describe, it, expect, vi } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "./Search.Bar";

describe("SearchBar", () => {
  it("renders with placeholder text", () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Search scholars..." />);
    const input = screen.getByPlaceholderText("Search scholars...");
    expect(input).toBeInTheDocument();
  });

  it("uses default placeholder when none provided", () => {
    render(<SearchBar value="" onChange={() => {}} />);
    const input = screen.getByPlaceholderText("Search...");
    expect(input).toBeInTheDocument();
  });

  it("displays the controlled value in the input", () => {
    render(<SearchBar value="test query" onChange={() => {}} />);
    const input = screen.getByDisplayValue("test query");
    expect(input).toBeInTheDocument();
  });

  it("calls onChange when user types", () => {
    const handleChange = vi.fn();

    render(<SearchBar value="" onChange={handleChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "lecture" } });

    expect(handleChange).toHaveBeenCalledWith("lecture");
  });

  it("shows clear button only when value is not empty", () => {
    const { rerender } = render(<SearchBar value="" onChange={() => {}} />);

    let clearButton = screen.queryByLabelText("Clear search");
    expect(clearButton).not.toBeInTheDocument();

    rerender(<SearchBar value="search term" onChange={() => {}} />);

    clearButton = screen.getByLabelText("Clear search");
    expect(clearButton).toBeInTheDocument();
  });

  it("clears input and calls onChange when clear button clicked", () => {
    const handleChange = vi.fn();

    render(<SearchBar value="search term" onChange={handleChange} />);
    const clearButton = screen.getByLabelText("Clear search");

    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith("");
  });

  it("calls onClear callback when clear button clicked", () => {
    const handleChange = vi.fn();
    const handleClear = vi.fn();

    render(<SearchBar value="search" onChange={handleChange} onClear={handleClear} />);
    const clearButton = screen.getByLabelText("Clear search");

    fireEvent.click(clearButton);

    expect(handleClear).toHaveBeenCalledOnce();
  });

  it("does not call onClear if not provided", () => {
    const handleChange = vi.fn();

    render(<SearchBar value="search" onChange={handleChange} />);
    const clearButton = screen.getByLabelText("Clear search");

    // Should not throw
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith("");
  });

  it("applies custom className to container", () => {
    const { container } = render(
      <SearchBar value="" onChange={() => {}} className="custom-class" />,
    );

    const barContainer = container.querySelector(".custom-class");
    expect(barContainer).toBeInTheDocument();
  });

  it("renders search icon visually", () => {
    const { container } = render(<SearchBar value="" onChange={() => {}} />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders input as a textbox role for accessibility", () => {
    render(<SearchBar value="" onChange={() => {}} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("input has aria-label for accessibility", () => {
    render(<SearchBar value="" onChange={() => {}} />);

    const input = screen.getByLabelText("Search input");
    expect(input).toBeInTheDocument();
  });

  it("clear button has aria-label for accessibility", () => {
    render(<SearchBar value="text" onChange={() => {}} />);

    const clearButton = screen.getByLabelText("Clear search");
    expect(clearButton).toBeInTheDocument();
  });

  it("handles rapid typing correctly", () => {
    const handleChange = vi.fn();

    render(<SearchBar value="" onChange={handleChange} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "hello world" } });

    expect(handleChange).toHaveBeenLastCalledWith("hello world");
  });
});
