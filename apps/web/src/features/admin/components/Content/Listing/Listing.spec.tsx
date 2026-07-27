import { describe, it, expect, beforeEach, vi } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { Listing } from "./Listing";
import type { AdminListingListItemDto } from "@sd/core-contracts";

vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: () => ({ isMobile: false }),
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    i18n: { language: "en" },
    t: (key: string, fallback: string) => fallback,
  }),
}));

vi.mock("@/features/admin/components/Content/Users/permission-gate/permission-gate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
});
