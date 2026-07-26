import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UploadArrangeUploadTab } from "./UploadArrangeUploadTab";
import { importFilesFromLines } from "@/features/admin/utils/resolve-import-urls";
import { extractAudioDuration } from "@/features/admin/utils/audio-metadata";
import type { UploadArrangeState } from "@/features/admin/hooks/Content/useUploadArrangeState";

vi.mock("@/features/admin/utils/resolve-import-urls", () => ({
  importFilesFromLines: vi.fn(),
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

function makeFile(name: string) {
  return new File(["bytes"], name, { type: "audio/mpeg" });
}

describe("UploadArrangeUploadTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (extractAudioDuration as Mock<any>).mockResolvedValue(120);
  });

  it("renders a paste-links textarea alongside the dropzone", () => {
    render(<UploadArrangeUploadTab state={baseState()} dispatch={vi.fn()} />);

    expect(screen.getByTestId("audio-files-input")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/one link per line/i)).toBeInTheDocument();
  });

  it("resolves pasted links and dispatches ADD_FILES with extracted durations", async () => {
    const file1 = makeFile("One.mp3");
    const file2 = makeFile("Two.mp3");
    (importFilesFromLines as Mock<any>).mockResolvedValue({
      files: [file1, file2],
      errors: [],
    });

    const dispatch = vi.fn();
    render(<UploadArrangeUploadTab state={baseState()} dispatch={dispatch} />);

    fireEvent.change(screen.getByPlaceholderText(/one link per line/i), {
      target: { value: "https://archive.org/details/ArafatTranslation" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add from links/i }));

    await waitFor(() => {
      expect(importFilesFromLines).toHaveBeenCalledWith([
        "https://archive.org/details/ArafatTranslation",
      ]);
    });

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: "ADD_FILES",
        files: [
          { file: file1, durationSeconds: 120 },
          { file: file2, durationSeconds: 120 },
        ],
      });
    });
  });

  it("keeps successfully-resolved files and surfaces failed links as an error", async () => {
    const file1 = makeFile("Good.mp3");
    (importFilesFromLines as Mock<any>).mockResolvedValue({
      files: [file1],
      errors: [{ input: "https://miraath.net/file.wav", message: "blocks direct downloads" }],
    });

    const dispatch = vi.fn();
    render(<UploadArrangeUploadTab state={baseState()} dispatch={dispatch} />);

    fireEvent.change(screen.getByPlaceholderText(/one link per line/i), {
      target: { value: "https://example.com/good.mp3\nhttps://miraath.net/file.wav" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add from links/i }));

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: "ADD_FILES",
        files: [{ file: file1, durationSeconds: 120 }],
      });
    });

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SET_ERROR",
        error: expect.stringContaining("blocks direct downloads"),
      }),
    );
  });

  it("does not dispatch ADD_FILES when every link fails to resolve", async () => {
    (importFilesFromLines as Mock<any>).mockResolvedValue({
      files: [],
      errors: [{ input: "https://miraath.net/file.wav", message: "blocks direct downloads" }],
    });

    const dispatch = vi.fn();
    render(<UploadArrangeUploadTab state={baseState()} dispatch={dispatch} />);

    fireEvent.change(screen.getByPlaceholderText(/one link per line/i), {
      target: { value: "https://miraath.net/file.wav" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add from links/i }));

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "SET_ERROR" }));
    });

    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "ADD_FILES" }));
  });
});
