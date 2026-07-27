import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ListingSublistingsTab } from "./ListingSublistingsTab";
import { fetchArrangeData, fetchListingFormData } from "@/features/admin/api/admin-lectures.api";

vi.mock("@/features/admin/api/admin-lectures.api", () => ({
  fetchArrangeData: vi.fn(),
  fetchListingFormData: vi.fn(),
  updateListingDetails: vi.fn(),
}));

const arrangeData = {
  id: "series-1",
  slug: "series-one",
  title: "Series One",
  format: "series" as const,
  scholarId: "scholar-1",
  status: "published" as const,
  modules: [
    {
      id: "module-1",
      slug: "module-one",
      title: "Module One",
      status: "published" as const,
      hasAudio: false,
      lessons: [
        {
          id: "lesson-1",
          slug: "lesson-one",
          title: "Lesson One",
          status: "draft" as const,
          hasAudio: true,
        },
      ],
    },
  ],
  lessons: [
    {
      id: "lesson-2",
      slug: "lesson-two",
      title: "Lesson Two",
      status: "published" as const,
      hasAudio: true,
    },
  ],
};

describe("ListingSublistingsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchArrangeData as Mock<any>).mockResolvedValue(arrangeData);
  });

  it("shows the flattened list of top-level lessons and modules with nested lessons", async () => {
    render(<ListingSublistingsTab rootListingId="series-1" />);

    expect(await screen.findByText("Lesson Two")).toBeInTheDocument();
    expect(screen.getByText("Module One")).toBeInTheDocument();
    expect(screen.getByText("Lesson One")).toBeInTheDocument();
  });

  it("shows an empty state when there are no children", async () => {
    (fetchArrangeData as Mock<any>).mockResolvedValue({ ...arrangeData, modules: [], lessons: [] });
    render(<ListingSublistingsTab rootListingId="series-1" />);

    expect(await screen.findByText(/no sub-listings yet/i)).toBeInTheDocument();
  });

  it("drills into a child on click and returns to the list on back", async () => {
    (fetchListingFormData as Mock<any>).mockResolvedValue({
      listing: {
        id: "lesson-2",
        title: "Lesson Two",
        slug: "lesson-two",
        description: "",
        format: "single" as const,
        status: "published" as const,
        scholarId: "scholar-1",
        scholarName: "Scholar One",
        orderIndex: 0,
        topics: [],
        language: "ar" as const,
        createdAt: "2024-01-01",
      },
      translations: [],
    });

    render(<ListingSublistingsTab rootListingId="series-1" />);

    fireEvent.click(await screen.findByText("Lesson Two"));

    await waitFor(() => {
      expect(fetchListingFormData).toHaveBeenCalledWith("lesson-2");
    });

    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    expect(await screen.findByText("Lesson Two")).toBeInTheDocument();
    expect(screen.getByText("Module One")).toBeInTheDocument();
  });
});
