import type { AdminListingListItemDto } from "@sd/core-contracts";

import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";

import { Listing } from "./Listing";

vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: () => ({ isMobile: false }),
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    i18n: { language: "en" },
    t: (key: string, fallback: string) => fallback,
  }),
}));

vi.mock("@sd/domain-account", () => ({
  useAbility: vi.fn(),
}));

describe("Listing", () => {
  const mockListing: AdminListingListItemDto = {
    id: "listing-1",
    title: "Test Lecture Title",
    scholarName: "Scholar Name",
    scholarSlug: "scholar-name",
    status: "published",
    format: "single",
    createdAt: "2024-01-01",
  };

  const mockOnEdit = vi.fn();
  const mockOnUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "manage", subject: "all" }]),
    });
  });

  it("renders listing title and metadata", () => {
    render(<Listing listing={mockListing} onEdit={mockOnEdit} onUpload={mockOnUpload} />);
    expect(screen.getByText("Test Lecture Title")).toBeInTheDocument();
    expect(screen.getByText(/Scholar Name/)).toBeInTheDocument();
  });

  it("renders Edit button and triggers onEdit when clicked", () => {
    render(<Listing listing={mockListing} onEdit={mockOnEdit} onUpload={mockOnUpload} />);
    const editBtn = screen.getByRole("button", { name: "Edit Test Lecture Title" });
    expect(editBtn).toBeInTheDocument();
    fireEvent.click(editBtn);
    expect(mockOnEdit).toHaveBeenCalledWith("listing-1");
  });

  it("renders Upload button and triggers onUpload when clicked", () => {
    render(<Listing listing={mockListing} onEdit={mockOnEdit} onUpload={mockOnUpload} />);
    const uploadBtn = screen.getByRole("button", { name: "Upload Test Lecture Title" });
    expect(uploadBtn).toBeInTheDocument();
    fireEvent.click(uploadBtn);
    expect(mockOnUpload).toHaveBeenCalledWith("listing-1");
  });

  it("hides Edit/Translate/Upload buttons when the ability grants nothing", () => {
    (useAbility as Mock<any>).mockReturnValue({ ability: createMongoAbility([]) });
    render(<Listing listing={mockListing} onEdit={mockOnEdit} onUpload={mockOnUpload} />);
    expect(screen.queryByRole("button", { name: /Edit/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Translate/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Upload/ })).not.toBeInTheDocument();
  });
});
