import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";

import {
  createLecture,
  updateListingDetails,
  fetchListingFormData,
  fetchArrangeData,
} from "@/features/admin/api/admin-lectures.api";

import { ListingModal } from "./ListingModal";

vi.mock("@/features/admin/api/admin-lectures.api", () => ({
  createLecture: vi.fn(),
  updateListingDetails: vi.fn(),
  fetchListingFormData: vi.fn(),
  fetchArrangeData: vi.fn().mockResolvedValue({
    id: "root",
    slug: "root",
    title: "Root",
    format: "series",
    scholarId: "scholar-1",
    status: "published",
    modules: [],
    lessons: [],
  }),
}));

vi.mock("@sd/core-contracts", () => {
  // Import the real module to preserve all exports
  const actual = require("@sd/core-contracts");
  return {
    ...actual,
    useApiQuery: vi.fn((key: any) => {
      if (key[0] === "scholars") {
        return {
          data: {
            scholars: [
              { id: "scholar-1", name: "Scholar One", slug: "scholar-one" },
              { id: "scholar-2", name: "Scholar Two", slug: "scholar-two" },
            ],
          },
          isFetching: false,
        };
      }
      return { data: undefined, isFetching: false };
    }),
  };
});

vi.mock("@sd/domain-search", () => ({
  useTopicsList: vi.fn(() => ({
    data: [
      { id: "topic-1", name: { en: "Topic One" }, slug: "topic-1" },
      { id: "topic-2", name: { en: "Topic Two" }, slug: "topic-2" },
    ],
    isFetching: false,
  })),
}));

vi.mock("@sd/domain-content", () => ({
  useAdminListingSeriesByScholar: vi.fn(() => ({
    data: [{ id: "series-1", slug: "series-one", title: "Series One" }],
    isFetching: false,
  })),
}));

describe("ListingModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(<ListingModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.queryByText(/lecture details/i)).not.toBeInTheDocument();
  });

  it("renders with create form fields and triggers save without any audio data", async () => {
    const onSuccessMock = vi.fn();
    const onCloseMock = vi.fn();
    (createLecture as Mock<any>).mockResolvedValue({ id: "new-lecture-id" });

    render(<ListingModal isOpen onClose={onCloseMock} onSuccess={onSuccessMock} />);

    expect(screen.getByText(/new listing details/i)).toBeInTheDocument();

    const scholarTrigger = screen.getByTestId("scholar-dropdown");
    fireEvent.click(scholarTrigger);
    const scholarOption = await screen.findByRole("option", { name: /scholar one/i });
    fireEvent.click(scholarOption);

    const slugSuffixInput = screen.getByLabelText(/slug/i);
    fireEvent.change(slugSuffixInput, { target: { value: "My Great Lecture" } });

    const topicChip = screen.getByText("Topic One");
    fireEvent.click(topicChip);

    const mainTabButton = screen.getByRole("tab", { name: /العربية/i });
    fireEvent.click(mainTabButton);

    const titleInput = await screen.findByLabelText(/^Title/i);
    fireEvent.change(titleInput, { target: { value: "My Great Lecture" } });

    const reviewButton = screen.getByRole("button", { name: /review/i });
    fireEvent.click(reviewButton);

    const saveButton = await screen.findByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(createLecture).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "My Great Lecture",
          slug: "scholar-one-my-great-lecture",
          scholarId: "scholar-1",
          format: "single",
          language: "ar",
        }),
      );
    });

    const createLecturePayload = (createLecture as Mock<any>).mock.calls[0]?.[0] as Record<
      string,
      unknown
    >;
    expect(createLecturePayload.audioKey).toBeUndefined();
    expect(createLecturePayload.durationSeconds).toBeUndefined();
    expect(createLecturePayload.sizeBytes).toBeUndefined();

    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("locks the slug input until a scholar is selected, then prefixes it with the scholar's slug", async () => {
    render(<ListingModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);

    const slugSuffixInput = screen.getByLabelText(/slug/i);
    expect(slugSuffixInput).toBeDisabled();
    expect(screen.queryByText("scholar-one-")).not.toBeInTheDocument();

    const scholarTrigger = screen.getByTestId("scholar-dropdown");
    fireEvent.click(scholarTrigger);
    const scholarOption = await screen.findByRole("option", { name: /scholar one/i });
    fireEvent.click(scholarOption);

    expect(slugSuffixInput).not.toBeDisabled();
    expect(screen.getByText("scholar-one-")).toBeInTheDocument();

    fireEvent.change(slugSuffixInput, { target: { value: "bayquniyyah" } });
    expect(slugSuffixInput).toHaveValue("bayquniyyah");
  });

  it("preserves the typed suffix and re-derives the prefix when the scholar selection changes", async () => {
    render(<ListingModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);

    const scholarTrigger = screen.getByTestId("scholar-dropdown");
    fireEvent.click(scholarTrigger);
    fireEvent.click(await screen.findByRole("option", { name: /scholar one/i }));

    const slugSuffixInput = screen.getByLabelText(/slug/i);
    fireEvent.change(slugSuffixInput, { target: { value: "bayquniyyah" } });

    fireEvent.click(scholarTrigger);
    fireEvent.click(await screen.findByRole("option", { name: /scholar two/i }));

    expect(screen.getByText("scholar-two-")).toBeInTheDocument();
    expect(slugSuffixInput).toHaveValue("bayquniyyah");
  });

  it("blocks submit when a scholar is selected but no slug suffix has been typed", async () => {
    render(<ListingModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);

    const scholarTrigger = screen.getByTestId("scholar-dropdown");
    fireEvent.click(scholarTrigger);
    fireEvent.click(await screen.findByRole("option", { name: /scholar one/i }));

    expect(screen.getByText(/enter a slug beyond the scholar prefix/i)).toBeInTheDocument();

    const topicChip = screen.getByText("Topic One");
    fireEvent.click(topicChip);

    const mainTabButton = screen.getByRole("tab", { name: /العربية/i });
    fireEvent.click(mainTabButton);
    const titleInput = await screen.findByLabelText(/^Title/i);
    fireEvent.change(titleInput, { target: { value: "Some Title" } });

    const reviewButton = screen.getByRole("button", { name: /review/i });
    fireEvent.click(reviewButton);
    const saveButton = await screen.findByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(createLecture).not.toHaveBeenCalled();
    });
  });

  it("renders with edit form fields prefilled and updates details", async () => {
    const onSuccessMock = vi.fn();
    const onCloseMock = vi.fn();
    (updateListingDetails as Mock<any>).mockResolvedValue({ id: "edit-lecture-id" });
    (fetchListingFormData as Mock<any>).mockResolvedValue({
      listing: {
        id: "lecture-123",
        title: "Existing Title",
        slug: "existing-title",
        description: "Existing Description",
        format: "single" as const,
        status: "draft" as const,
        scholarId: "scholar-2",
        scholarName: "Scholar Two",
        parentId: "series-1",
        orderIndex: 5,
        topics: ["topic-1"],
        language: "ar" as const,
        audioKey: "audio/old-key.mp3",
        createdAt: "2024-01-01",
        audioAssets: [],
      },
      translations: [],
    });

    render(
      <ListingModal
        isOpen
        onClose={onCloseMock}
        onSuccess={onSuccessMock}
        listingId="lecture-123"
      />,
    );

    expect(screen.getByText(/editing listing details/i)).toBeInTheDocument();

    // Wait for form data to load
    await waitFor(() => {
      expect(fetchListingFormData).toHaveBeenCalledWith("lecture-123");
    });

    await waitFor(() => {
      expect(screen.getByTestId("scholar-dropdown")).toHaveTextContent("Scholar Two");
    });

    const slugInput = screen.getByLabelText(/slug/i);
    expect(slugInput).toHaveValue("existing-title");
    expect(slugInput).toBeDisabled();

    const mainTabButton = screen.getByRole("tab", { name: /العربية/i });
    fireEvent.click(mainTabButton);

    const titleInput = await screen.findByLabelText(/^Title/i);
    const descriptionInput = await screen.findByLabelText(/description/i);
    expect(titleInput).toHaveValue("Existing Title");
    expect(descriptionInput).toHaveValue("Existing Description");

    fireEvent.change(titleInput, { target: { value: "Updated Title" } });

    const generalTabButton = screen.getByRole("tab", { name: /general/i });
    fireEvent.click(generalTabButton);

    const orderIndexInput = await screen.findByLabelText(/order index/i);
    expect(orderIndexInput).toHaveValue("5");
    fireEvent.change(orderIndexInput, { target: { value: "10" } });

    const reviewButton = screen.getByRole("button", { name: /review/i });
    fireEvent.click(reviewButton);

    const saveButton = await screen.findByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateListingDetails).toHaveBeenCalledWith(
        "lecture-123",
        expect.objectContaining({
          title: "Updated Title",
          description: "Existing Description",
          status: "draft",
          orderIndex: 10,
          language: "ar",
        }),
      );
    });

    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("review tab shows no changes when editing an untouched listing, and only the touched field once edited", async () => {
    (fetchListingFormData as Mock<any>).mockResolvedValue({
      listing: {
        id: "lecture-456",
        title: "Existing Title",
        slug: "existing-title",
        description: "Existing Description",
        format: "single" as const,
        status: "draft" as const,
        scholarId: "scholar-2",
        scholarName: "Scholar Two",
        orderIndex: 5,
        topics: ["topic-1"],
        language: "ar" as const,
        audioKey: "audio/old-key.mp3",
        createdAt: "2024-01-01",
        audioAssets: [],
      },
      translations: [],
    });

    render(<ListingModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} listingId="lecture-456" />);

    await waitFor(() => {
      expect(fetchListingFormData).toHaveBeenCalledWith("lecture-456");
    });
    await waitFor(() => {
      expect(screen.getByTestId("scholar-dropdown")).toHaveTextContent("Scholar Two");
    });

    const reviewButton = screen.getByRole("button", { name: /review/i });
    fireEvent.click(reviewButton);

    // Nothing was edited yet, so pre-existing values must not appear as changes.
    expect(screen.getByText(/no changes made yet/i)).toBeInTheDocument();
    expect(screen.queryByText("Existing Title")).not.toBeInTheDocument();
    expect(screen.queryByText("Existing Description")).not.toBeInTheDocument();
    expect(screen.queryByText("Topic One")).not.toBeInTheDocument();

    // Now actually change only the title.
    const mainTabButton = screen.getByRole("tab", { name: /العربية/i });
    fireEvent.click(mainTabButton);
    const titleInput = await screen.findByLabelText(/^Title/i);
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });

    fireEvent.click(reviewButton);

    expect(screen.getByText("Updated Title")).toBeInTheDocument();
    // Description and topics were never touched, so they must not appear as changes.
    expect(screen.queryByText("Existing Description")).not.toBeInTheDocument();
    expect(screen.queryByText("Topic One")).not.toBeInTheDocument();
  });

  it("shows a Sub-listings tab when editing a series listing, and loads its children", async () => {
    (fetchListingFormData as Mock<any>).mockResolvedValue({
      listing: {
        id: "series-123",
        title: "Series Title",
        slug: "series-title",
        description: "",
        format: "series" as const,
        status: "published" as const,
        scholarId: "scholar-2",
        scholarName: "Scholar Two",
        orderIndex: 0,
        topics: ["topic-1"],
        language: "ar" as const,
        createdAt: "2024-01-01",
      },
      translations: [],
    });

    render(<ListingModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} listingId="series-123" />);

    await waitFor(() => {
      expect(fetchListingFormData).toHaveBeenCalledWith("series-123");
    });

    const sublistingsTab = await screen.findByRole("tab", { name: /sub-listings/i });
    fireEvent.click(sublistingsTab);

    await waitFor(() => {
      expect(fetchArrangeData).toHaveBeenCalledWith("series-123");
    });
  });

  it("does not show a Sub-listings tab for a single-format listing", async () => {
    (fetchListingFormData as Mock<any>).mockResolvedValue({
      listing: {
        id: "single-123",
        title: "Single Title",
        slug: "single-title",
        description: "",
        format: "single" as const,
        status: "published" as const,
        scholarId: "scholar-2",
        scholarName: "Scholar Two",
        orderIndex: 0,
        topics: ["topic-1"],
        language: "ar" as const,
        createdAt: "2024-01-01",
      },
      translations: [],
    });

    render(<ListingModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} listingId="single-123" />);

    await waitFor(() => {
      expect(fetchListingFormData).toHaveBeenCalledWith("single-123");
    });

    expect(screen.queryByRole("tab", { name: /sub-listings/i })).not.toBeInTheDocument();
  });

  it("does not show a Sub-listings tab when creating a new listing", () => {
    render(<ListingModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.queryByRole("tab", { name: /sub-listings/i })).not.toBeInTheDocument();
  });
});
