import { vi } from "vitest";
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
  isKibar: false,
  lectureCount: 42,
};

describe("ScholarListRow", () => {
  it("renders scholar details successfully", () => {
    render(<ScholarListRow scholar={mockScholar} />);
    expect(screen.getByText("Abdul Aziz bin Baz")).toBeInTheDocument();
    expect(screen.getByText("ar")).toBeInTheDocument();
    expect(screen.getByText("42 lectures")).toBeInTheDocument();
  });

  it("renders Senior Scholar badge when isKibar is true", () => {
    render(<ScholarListRow scholar={{ ...mockScholar, isKibar: true }} />);
    expect(screen.getByText("Senior Scholar")).toBeInTheDocument();
  });

  it("does not render Senior Scholar badge when isKibar is false", () => {
    render(<ScholarListRow scholar={mockScholar} />);
    expect(screen.queryByText("Senior Scholar")).not.toBeInTheDocument();
  });

  it("renders avatar image when imageUrl is present", () => {
    render(<ScholarListRow scholar={{ ...mockScholar, imageUrl: "/images/binbaz.jpg" }} />);
    const img = screen.getByRole("img", { name: "Abdul Aziz bin Baz" });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("binbaz.jpg");
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
