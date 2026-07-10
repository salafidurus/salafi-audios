import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SearchFilter, type FilterChip } from "./Search.Filter";

const mockChips: FilterChip[] = [
  { id: "lecture", label: "Lectures" },
  { id: "article", label: "Articles" },
  { id: "series", label: "Series" },
];

describe("SearchFilter", () => {
  it("renders all chips from the chips prop", () => {
    render(<SearchFilter chips={mockChips} selected={[]} onChipChange={() => {}} />);

    expect(screen.getByText("Lectures")).toBeInTheDocument();
    expect(screen.getByText("Articles")).toBeInTheDocument();
    expect(screen.getByText("Series")).toBeInTheDocument();
  });

  it("renders no chips when chips array is empty", () => {
    render(<SearchFilter chips={[]} selected={[]} onChipChange={() => {}} />);

    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(0);
  });

  it("applies selected state to selected chips", () => {
    render(
      <SearchFilter chips={mockChips} selected={["lecture", "article"]} onChipChange={() => {}} />,
    );

    const lectureChip = screen.getByLabelText("Filter by Lectures");
    const articleChip = screen.getByLabelText("Filter by Articles");
    const seriesChip = screen.getByLabelText("Filter by Series");

    expect(lectureChip).toHaveAttribute("aria-pressed", "true");
    expect(articleChip).toHaveAttribute("aria-pressed", "true");
    expect(seriesChip).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChipChange when a chip is clicked", () => {
    const handleChipChange = vi.fn();

    render(<SearchFilter chips={mockChips} selected={[]} onChipChange={handleChipChange} />);

    const lectureChip = screen.getByLabelText("Filter by Lectures");
    fireEvent.click(lectureChip);

    expect(handleChipChange).toHaveBeenCalledWith("lecture");
  });

  it("calls onChipChange for each chip click independently", () => {
    const handleChipChange = vi.fn();

    render(<SearchFilter chips={mockChips} selected={[]} onChipChange={handleChipChange} />);

    const lectureChip = screen.getByLabelText("Filter by Lectures");
    const articleChip = screen.getByLabelText("Filter by Articles");

    fireEvent.click(lectureChip);
    fireEvent.click(articleChip);

    expect(handleChipChange).toHaveBeenCalledTimes(2);
    expect(handleChipChange).toHaveBeenNthCalledWith(1, "lecture");
    expect(handleChipChange).toHaveBeenNthCalledWith(2, "article");
  });

  it("shows close button only on selected chips when showCloseButton is true", () => {
    render(
      <SearchFilter
        chips={mockChips}
        selected={["lecture"]}
        onChipChange={() => {}}
        showCloseButton={true}
      />,
    );

    const lectureCloseButton = screen.getByLabelText("Remove Lectures filter");
    expect(lectureCloseButton).toBeInTheDocument();

    // Close button should not exist for unselected chips
    const articleCloseButtons = screen.queryAllByLabelText("Remove Articles filter");
    expect(articleCloseButtons).toHaveLength(0);
  });

  it("hides close button when showCloseButton is false", () => {
    render(
      <SearchFilter
        chips={mockChips}
        selected={["lecture"]}
        onChipChange={() => {}}
        showCloseButton={false}
      />,
    );

    const closeButtons = screen.queryAllByLabelText(/Remove .* filter/);
    expect(closeButtons).toHaveLength(0);
  });

  it("shows close button by default (showCloseButton defaults to true)", () => {
    render(<SearchFilter chips={mockChips} selected={["lecture"]} onChipChange={() => {}} />);

    const lectureCloseButton = screen.getByLabelText("Remove Lectures filter");
    expect(lectureCloseButton).toBeInTheDocument();
  });

  it("calls onChipRemove when close button is clicked", () => {
    const handleRemove = vi.fn();

    render(
      <SearchFilter
        chips={mockChips}
        selected={["lecture"]}
        onChipChange={() => {}}
        onChipRemove={handleRemove}
      />,
    );

    const lectureCloseButton = screen.getByLabelText("Remove Lectures filter");
    fireEvent.click(lectureCloseButton);

    expect(handleRemove).toHaveBeenCalledWith("lecture");
  });

  it("does not trigger onChipChange when close button is clicked", () => {
    const handleChipChange = vi.fn();
    const handleRemove = vi.fn();

    render(
      <SearchFilter
        chips={mockChips}
        selected={["lecture"]}
        onChipChange={handleChipChange}
        onChipRemove={handleRemove}
      />,
    );

    const lectureCloseButton = screen.getByLabelText("Remove Lectures filter");
    fireEvent.click(lectureCloseButton);

    expect(handleRemove).toHaveBeenCalledWith("lecture");
    expect(handleChipChange).not.toHaveBeenCalled();
  });

  it("does not call onChipRemove if not provided", () => {
    render(<SearchFilter chips={mockChips} selected={["lecture"]} onChipChange={() => {}} />);

    const lectureCloseButton = screen.getByLabelText("Remove Lectures filter");

    // Should not throw
    fireEvent.click(lectureCloseButton);
  });

  it("applies custom className to container", () => {
    const { container } = render(
      <SearchFilter
        chips={mockChips}
        selected={[]}
        onChipChange={() => {}}
        className="custom-filters"
      />,
    );

    const filterContainer = container.querySelector(".custom-filters");
    expect(filterContainer).toBeInTheDocument();
  });

  it("renders chip buttons with correct aria-label", () => {
    render(<SearchFilter chips={mockChips} selected={[]} onChipChange={() => {}} />);

    expect(screen.getByLabelText("Filter by Lectures")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by Articles")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by Series")).toBeInTheDocument();
  });

  it("updates aria-pressed when selected state changes", () => {
    const { rerender } = render(
      <SearchFilter chips={mockChips} selected={[]} onChipChange={() => {}} />,
    );

    let lectureChip = screen.getByLabelText("Filter by Lectures");
    expect(lectureChip).toHaveAttribute("aria-pressed", "false");

    rerender(<SearchFilter chips={mockChips} selected={["lecture"]} onChipChange={() => {}} />);

    lectureChip = screen.getByLabelText("Filter by Lectures");
    expect(lectureChip).toHaveAttribute("aria-pressed", "true");
  });

  it("handles multiple selected chips", () => {
    render(
      <SearchFilter
        chips={mockChips}
        selected={["lecture", "article", "series"]}
        onChipChange={() => {}}
      />,
    );

    const lectureChip = screen.getByLabelText("Filter by Lectures");
    const articleChip = screen.getByLabelText("Filter by Articles");
    const seriesChip = screen.getByLabelText("Filter by Series");

    expect(lectureChip).toHaveAttribute("aria-pressed", "true");
    expect(articleChip).toHaveAttribute("aria-pressed", "true");
    expect(seriesChip).toHaveAttribute("aria-pressed", "true");
  });

  it("handles single chip selection", () => {
    render(
      <SearchFilter
        chips={[{ id: "only", label: "Only Option" }]}
        selected={[]}
        onChipChange={() => {}}
      />,
    );

    const onlyChip = screen.getByLabelText("Filter by Only Option");
    expect(onlyChip).toHaveAttribute("aria-pressed", "false");
  });

  it("preserves order of chips as provided", () => {
    render(<SearchFilter chips={mockChips} selected={[]} onChipChange={() => {}} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveTextContent("Lectures");
    expect(buttons[1]).toHaveTextContent("Articles");
    expect(buttons[2]).toHaveTextContent("Series");
  });

  it("handles chip with special characters in label", () => {
    const specialChips = [
      { id: "c-plus-plus", label: "C++" },
      { id: "dot-net", label: ".NET" },
    ];

    render(<SearchFilter chips={specialChips} selected={[]} onChipChange={() => {}} />);

    expect(screen.getByText("C++")).toBeInTheDocument();
    expect(screen.getByText(".NET")).toBeInTheDocument();
  });

  it("handles chip with long label", () => {
    const longChips = [
      {
        id: "very-long",
        label: "This is a very long filter label that might wrap on mobile devices",
      },
    ];

    render(<SearchFilter chips={longChips} selected={[]} onChipChange={() => {}} />);

    expect(
      screen.getByText("This is a very long filter label that might wrap on mobile devices"),
    ).toBeInTheDocument();
  });

  it("handles rapid chip clicks", () => {
    const handleChipChange = vi.fn();

    render(<SearchFilter chips={mockChips} selected={[]} onChipChange={handleChipChange} />);

    const lectureChip = screen.getByLabelText("Filter by Lectures");
    const articleChip = screen.getByLabelText("Filter by Articles");

    fireEvent.click(lectureChip);
    fireEvent.click(articleChip);
    fireEvent.click(lectureChip);

    expect(handleChipChange).toHaveBeenCalledTimes(3);
  });

  it("maintains correct close button aria-label for each selected chip", () => {
    render(
      <SearchFilter chips={mockChips} selected={["lecture", "article"]} onChipChange={() => {}} />,
    );

    const lectureCloseButton = screen.getByLabelText("Remove Lectures filter");
    const articleCloseButton = screen.getByLabelText("Remove Articles filter");

    expect(lectureCloseButton).toBeInTheDocument();
    expect(articleCloseButton).toBeInTheDocument();
  });

  it("accepts multiple prop for single-select mode (default)", () => {
    const handleChipChange = vi.fn();

    render(
      <SearchFilter
        chips={mockChips}
        selected={["lecture"]}
        onChipChange={handleChipChange}
        multiple={false}
      />,
    );

    const lectureChip = screen.getByLabelText("Filter by Lectures");
    expect(lectureChip).toHaveAttribute("aria-pressed", "true");
  });

  it("accepts multiple prop for multi-select mode", () => {
    const handleChipChange = vi.fn();

    render(
      <SearchFilter
        chips={mockChips}
        selected={["lecture", "article"]}
        onChipChange={handleChipChange}
        multiple={true}
      />,
    );

    const lectureChip = screen.getByLabelText("Filter by Lectures");
    const articleChip = screen.getByLabelText("Filter by Articles");

    expect(lectureChip).toHaveAttribute("aria-pressed", "true");
    expect(articleChip).toHaveAttribute("aria-pressed", "true");
  });

  it("defaults to single-select mode when multiple prop is not provided", () => {
    render(<SearchFilter chips={mockChips} selected={["lecture"]} onChipChange={() => {}} />);

    const lectureChip = screen.getByLabelText("Filter by Lectures");
    expect(lectureChip).toHaveAttribute("aria-pressed", "true");
  });
});
