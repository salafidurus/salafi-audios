import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";

import {
  fetchListingFormData,
  updateListingDetails,
} from "@/features/admin/api/admin-lectures.api";

import { ListingSublistingDetail } from "./ListingSublistingDetail";

vi.mock("@/features/admin/api/admin-lectures.api", () => ({
  fetchListingFormData: vi.fn(),
  updateListingDetails: vi.fn(),
}));

const childFormData = {
  listing: {
    id: "lesson-1",
    title: "Lesson One",
    slug: "lesson-one",
    description: "Original description",
    format: "single" as const,
    status: "draft" as const,
    scholarId: "scholar-1",
    scholarName: "Scholar One",
    parentId: "series-1",
    orderIndex: 2,
    topics: [],
    language: "ar" as const,
    createdAt: "2024-01-01",
  },
  translations: [],
};

describe("ListingSublistingDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchListingFormData as Mock<any>).mockResolvedValue(childFormData);
    (updateListingDetails as Mock<any>).mockResolvedValue({ id: "lesson-1" });
  });

  it("loads and displays the child's title, description, status, and order index", async () => {
    render(<ListingSublistingDetail childId="lesson-1" onBack={vi.fn()} onSaved={vi.fn()} />);

    expect(fetchListingFormData).toHaveBeenCalledWith("lesson-1");

    const titleInput = await screen.findByLabelText(/^Title/i);
    expect(titleInput).toHaveValue("Lesson One");
    expect(screen.getByLabelText(/description/i)).toHaveValue("Original description");
    expect(screen.getByLabelText(/order index/i)).toHaveValue("2");
  });

  it("saves edited fields via updateListingDetails and calls onSaved", async () => {
    const onSaved = vi.fn();
    render(<ListingSublistingDetail childId="lesson-1" onBack={vi.fn()} onSaved={onSaved} />);

    const titleInput = await screen.findByLabelText(/^Title/i);
    fireEvent.change(titleInput, { target: { value: "Updated Lesson Title" } });

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateListingDetails).toHaveBeenCalledWith(
        "lesson-1",
        expect.objectContaining({
          title: "Updated Lesson Title",
          description: "Original description",
          status: "draft",
          orderIndex: 2,
        }),
      );
    });

    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("calls onBack when the back button is clicked", async () => {
    const onBack = vi.fn();
    render(<ListingSublistingDetail childId="lesson-1" onBack={onBack} onSaved={vi.fn()} />);

    await screen.findByLabelText(/^Title/i);
    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
