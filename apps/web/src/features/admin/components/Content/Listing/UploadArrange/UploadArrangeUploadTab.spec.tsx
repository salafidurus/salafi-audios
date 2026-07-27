import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";

import type { UploadArrangeState } from "@/features/admin/hooks/Content/useUploadArrangeState";

import { extractAudioDuration } from "@/features/admin/utils/audio-metadata";
import { resolveLinksToMetadata } from "@/features/admin/utils/resolve-import-urls";

import { UploadArrangeUploadTab } from "./UploadArrangeUploadTab";

vi.mock("@/features/admin/utils/resolve-import-urls", () => ({
  resolveLinksToMetadata: vi.fn(),
}));

vi.mock("@/features/admin/utils/audio-metadata", () => ({
  extractAudioDuration: vi.fn(),
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

function baseState(): UploadArrangeState {
  return {
    existing: {
      id: "lecture-123",
      slug: "test-series",
      title: "Test Series",
      format: "series",
      scholarId: "scholar-1",
      status: "published",
      modules: [],
      lessons: [],
    },
    items: [],
    newModules: [],
    phase: "editing",
    error: null,
    conflictSlugs: [],
  };
}

function metadataItem(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    url: "https://archive.org/download/Item/One.mp3",
    filename: "One.mp3",
    contentType: "audio/mpeg",
    sizeBytes: 1_000_000,
    durationSeconds: 120,
    ...overrides,
  };
}

describe("UploadArrangeUploadTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (extractAudioDuration as Mock<any>).mockResolvedValue(120);
  });

  it("renders a single link input row alongside the dropzone", () => {
    render(<UploadArrangeUploadTab state={baseState()} dispatch={vi.fn()} />);

    expect(screen.getByTestId("audio-files-input")).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/https:\/\//i)).toHaveLength(1);
  });

  it("adds another link input when 'Add another link' is clicked", () => {
    render(<UploadArrangeUploadTab state={baseState()} dispatch={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /add another link/i }));

    expect(screen.getAllByPlaceholderText(/https:\/\//i)).toHaveLength(2);
  });

  it("removes a row when its remove control is clicked", () => {
    render(<UploadArrangeUploadTab state={baseState()} dispatch={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /add another link/i }));
    expect(screen.getAllByPlaceholderText(/https:\/\//i)).toHaveLength(2);

    fireEvent.click(screen.getAllByRole("button", { name: /remove link/i })[0]!);

    expect(screen.getAllByPlaceholderText(/https:\/\//i)).toHaveLength(1);
  });

  it("resolves entered links to metadata only (no file body fetch) and dispatches ADD_URL_ITEMS", async () => {
    (resolveLinksToMetadata as Mock<any>).mockResolvedValue({
      items: [
        metadataItem(),
        metadataItem({ url: "https://archive.org/download/Item/Two.mp3", filename: "Two.mp3" }),
      ],
      errors: [],
    });

    const dispatch = vi.fn();
    render(<UploadArrangeUploadTab state={baseState()} dispatch={dispatch} />);

    fireEvent.change(screen.getByPlaceholderText(/https:\/\//i), {
      target: { value: "https://archive.org/details/Item" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add from links/i }));

    await waitFor(() => {
      expect(resolveLinksToMetadata).toHaveBeenCalledWith(["https://archive.org/details/Item"]);
    });

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: "ADD_URL_ITEMS",
        items: [
          {
            url: "https://archive.org/download/Item/One.mp3",
            filename: "One.mp3",
            contentType: "audio/mpeg",
            sizeBytes: 1_000_000,
            durationSeconds: 120,
          },
          {
            url: "https://archive.org/download/Item/Two.mp3",
            filename: "Two.mp3",
            contentType: "audio/mpeg",
            sizeBytes: 1_000_000,
            durationSeconds: 120,
          },
        ],
      });
    });
  });

  it("resets to a single empty row after a successful add", async () => {
    (resolveLinksToMetadata as Mock<any>).mockResolvedValue({
      items: [metadataItem()],
      errors: [],
    });

    render(<UploadArrangeUploadTab state={baseState()} dispatch={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /add another link/i }));
    fireEvent.change(screen.getAllByPlaceholderText(/https:\/\//i)[0]!, {
      target: { value: "https://archive.org/download/Item/One.mp3" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add from links/i }));

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText(/https:\/\//i)).toHaveLength(1);
    });
  });

  it("keeps successfully-resolved items and surfaces failed links as an error", async () => {
    (resolveLinksToMetadata as Mock<any>).mockResolvedValue({
      items: [metadataItem()],
      errors: [{ input: "https://miraath.net/file.wav", message: "blocks direct downloads" }],
    });

    const dispatch = vi.fn();
    render(<UploadArrangeUploadTab state={baseState()} dispatch={dispatch} />);

    fireEvent.change(screen.getByPlaceholderText(/https:\/\//i), {
      target: { value: "https://miraath.net/file.wav" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add from links/i }));

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "ADD_URL_ITEMS" }));
    });

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SET_ERROR",
        error: expect.stringContaining("blocks direct downloads"),
      }),
    );
  });

  it("does not dispatch ADD_URL_ITEMS when every link fails to resolve", async () => {
    (resolveLinksToMetadata as Mock<any>).mockResolvedValue({
      items: [],
      errors: [{ input: "https://miraath.net/file.wav", message: "blocks direct downloads" }],
    });

    const dispatch = vi.fn();
    render(<UploadArrangeUploadTab state={baseState()} dispatch={dispatch} />);

    fireEvent.change(screen.getByPlaceholderText(/https:\/\//i), {
      target: { value: "https://miraath.net/file.wav" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add from links/i }));

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "SET_ERROR" }));
    });

    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "ADD_URL_ITEMS" }));
  });
});
