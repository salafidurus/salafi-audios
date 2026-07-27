import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";

import { fetchArrangeData } from "@/features/admin/api/admin-lectures.api";

import { ListingUploadArrangeModal } from "./ListingUploadArrangeModal";

vi.mock("@/features/admin/api/admin-lectures.api", () => ({
  fetchArrangeData: vi.fn(),
  getBatchPresignedUrls: vi.fn(),
  uploadToR2WithProgress: vi.fn(),
  commitArrange: vi.fn(),
  updateListingMedia: vi.fn(),
  ArrangeConflictError: class ArrangeConflictError extends Error {
    conflictingSlugs: string[] = [];
  },
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

  it("fetches arrange data and renders upload, arrange, and review tabs", async () => {
    (fetchArrangeData as Mock<any>).mockResolvedValue({
      id: "lecture-123",
      slug: "test-series",
      title: "Test Series",
      format: "series" as const,
      scholarId: "scholar-1",
      status: "published" as const,
      modules: [],
      lessons: [],
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
    expect(fetchArrangeData).toHaveBeenCalledWith("lecture-123");
    expect(screen.getByRole("tab", { name: /arrange/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /review/i })).toBeInTheDocument();
    expect(screen.getByText(/Test Series/)).toBeInTheDocument();
  });

  it("shows the multi-file dropzone with the filename ordering hint", async () => {
    (fetchArrangeData as Mock<any>).mockResolvedValue({
      id: "lecture-123",
      slug: "test-series",
      title: "Test Series",
      format: "series" as const,
      scholarId: "scholar-1",
      status: "published" as const,
      modules: [],
      lessons: [],
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
      expect(screen.getByTestId("audio-files-input")).toBeInTheDocument();
    });
    expect(screen.getByText(/ordered by their number automatically/i)).toBeInTheDocument();
  });
});
