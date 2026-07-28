import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";

import { fetchArrangeData, fetchListingFormData } from "@/features/admin/api/admin-lectures.api";

import { ListingSublistingsTab } from "./ListingSublistingsTab";

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

  it("shows top-level lessons and module headers; nested lessons start collapsed", async () => {
    render(<ListingSublistingsTab rootListingId="series-1" />);

    expect(await screen.findByText("Lesson Two")).toBeInTheDocument();
    expect(screen.getByText("Module One")).toBeInTheDocument();
    // Lesson One is inside Module One which starts collapsed — not in the DOM yet.
    expect(screen.queryByText("Lesson One")).not.toBeInTheDocument();

    // Expanding Module One reveals Lesson One.
    fireEvent.click(screen.getByRole("button", { name: /expand lessons/i }));
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

  it("accordion: expanding module A then clicking module B collapses A and opens B", async () => {
    const twoModuleData = {
      ...arrangeData,
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
              hasAudio: false,
            },
          ],
        },
        {
          id: "module-2",
          slug: "module-two",
          title: "Module Two",
          status: "published" as const,
          hasAudio: false,
          lessons: [
            {
              id: "lesson-3",
              slug: "lesson-three",
              title: "Lesson Three",
              status: "draft" as const,
              hasAudio: false,
            },
          ],
        },
      ],
      lessons: [],
    };
    (fetchArrangeData as Mock<any>).mockResolvedValue(twoModuleData);
    render(<ListingSublistingsTab rootListingId="series-1" />);

    await screen.findByText("Module One");
    const [chevronA, chevronB] = screen.getAllByRole("button", { name: /expand lessons/i });

    // Open module A
    fireEvent.click(chevronA!);
    expect(screen.getByText("Lesson One")).toBeInTheDocument();
    expect(screen.queryByText("Lesson Three")).not.toBeInTheDocument();

    // Open module B — module A should now be collapsed
    fireEvent.click(chevronB!);
    expect(screen.getByText("Lesson Three")).toBeInTheDocument();
    expect(screen.queryByText("Lesson One")).not.toBeInTheDocument();
  });

  it("clicking the module title button drills into the module detail WITHOUT expanding its lessons", async () => {
    (fetchListingFormData as Mock<any>).mockResolvedValue({
      listing: {
        id: "module-1",
        title: "Module One",
        slug: "module-one",
        description: "",
        format: "series" as const,
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

    await screen.findByText("Module One");
    // "Lesson One" is NOT yet visible (module collapsed)
    expect(screen.queryByText("Lesson One")).not.toBeInTheDocument();

    // Click the module title button (not the chevron)
    fireEvent.click(screen.getByText("Module One"));

    // Navigates to detail — accordion state irrelevant (lessons still not shown in list)
    await waitFor(() => {
      expect(fetchListingFormData).toHaveBeenCalledWith("module-1");
    });
  });

  it("Publish All calls updateListingDetails with published for all children", async () => {
    const { updateListingDetails } = await import("@/features/admin/api/admin-lectures.api");
    (updateListingDetails as Mock<any>).mockResolvedValue({});
    render(<ListingSublistingsTab rootListingId="series-1" />);

    await screen.findByText("Lesson Two");
    fireEvent.click(screen.getByRole("button", { name: /publish all/i }));

    await waitFor(() => {
      expect(updateListingDetails).toHaveBeenCalledWith("lesson-2", { status: "published" });
      expect(updateListingDetails).toHaveBeenCalledWith("module-1", { status: "published" });
      expect(updateListingDetails).toHaveBeenCalledWith("lesson-1", { status: "published" });
    });
  });

  it("Draft All calls updateListingDetails with draft for all children", async () => {
    const { updateListingDetails } = await import("@/features/admin/api/admin-lectures.api");
    (updateListingDetails as Mock<any>).mockResolvedValue({});
    render(<ListingSublistingsTab rootListingId="series-1" />);

    await screen.findByText("Lesson Two");
    fireEvent.click(screen.getByRole("button", { name: /draft all/i }));

    await waitFor(() => {
      expect(updateListingDetails).toHaveBeenCalledWith("lesson-2", { status: "draft" });
      expect(updateListingDetails).toHaveBeenCalledWith("module-1", { status: "draft" });
      expect(updateListingDetails).toHaveBeenCalledWith("lesson-1", { status: "draft" });
    });
  });
});
