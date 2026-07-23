import { describe, it, expect, vi } from "bun:test";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ScholarListItemDto } from "@sd/core-contracts";
import { ScholarListRow } from "./scholar-list-row";

const mockScholar: ScholarListItemDto = {
  id: "sch-1",
  slug: "ibn-baz",
  name: "Abdul Aziz bin Baz",
  imageUrl: undefined,
  mainLanguage: "ar" as any,
  isKibar: true,
  lectureCount: 42,
};

describe("ScholarListRow", () => {
  it("renders scholar details successfully", () => {
    render(<ScholarListRow scholar={mockScholar} />);
    expect(screen.getByText("Abdul Aziz bin Baz")).toBeInTheDocument();
    expect(screen.getByText("ar")).toBeInTheDocument();
    expect(screen.getByText("42 lectures")).toBeInTheDocument();
  });

  it("never renders a Senior Scholar badge (isKibar removed)", () => {
    render(<ScholarListRow scholar={mockScholar} />);
    expect(screen.queryByText("Senior Scholar")).not.toBeInTheDocument();
  });

  it("renders avatar image when imageUrl is present", () => {
    const { container } = render(
      <ScholarListRow
        scholar={{ ...mockScholar, imageUrl: "https://example.com/images/binbaz.jpg" }}
      />,
    );
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("src")).toContain("binbaz.jpg");
  });

  it("renders fallback initial avatar when imageUrl is not present", () => {
    render(<ScholarListRow scholar={mockScholar} />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("calls onPress with the scholar slug when clicked", () => {
    const onPressMock = vi.fn();
    render(<ScholarListRow scholar={mockScholar} onPress={onPressMock} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onPressMock).toHaveBeenCalledWith("ibn-baz");
  });
});
