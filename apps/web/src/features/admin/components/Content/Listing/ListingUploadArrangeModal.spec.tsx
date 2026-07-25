import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ListingUploadArrangeModal } from "./ListingUploadArrangeModal";
import { fetchListingMediaData, updateListingMedia } from "@/features/admin/api/admin-lectures.api";

vi.mock("@/features/admin/api/admin-lectures.api", () => ({
  fetchListingMediaData: vi.fn(),
  updateListingMedia: vi.fn(),
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    i18n: { language: "en" },
    t: (key: string, fallback: string) => fallback,
  }),
}));

vi.mock("@/shared/hooks/use-responsive", () => ({
  useIsDesktop: () => true,
}));

describe("ListingUploadArrangeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(
      <ListingUploadArrangeModal
        isOpen={false}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        listingId="lecture-123"
      />,
    );
    expect(screen.queryByText(/upload/i)).not.toBeInTheDocument();
  });

  it("renders upload, arrange, and review tabs for a listing", async () => {
    (fetchListingMediaData as Mock<any>).mockResolvedValue({
      id: "lecture-123",
      title: "Test Audio Lecture",
      audioKey: "audio/existing.mp3",
      durationSeconds: 120,
      format: "single" as const,
      audioAssets: [],
    });

    render(
      <ListingUploadArrangeModal
        isOpen
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        listingId="lecture-123"
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /upload audio/i })).toBeInTheDocument();
    });

    expect(screen.getByRole("tab", { name: /arrange/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /review/i })).toBeInTheDocument();
  });
});
