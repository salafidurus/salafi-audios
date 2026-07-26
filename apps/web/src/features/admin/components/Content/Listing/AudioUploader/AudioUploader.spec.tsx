import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AudioUploader } from "./AudioUploader";
import { getPresignedUrl, uploadToR2 } from "@/features/admin/api/admin-lectures.api";
import { importSingleLineWithProgress } from "@/features/admin/utils/resolve-import-urls";

vi.mock("@/features/admin/api/admin-lectures.api", () => ({
  getPresignedUrl: vi.fn(),
  uploadToR2: vi.fn(),
}));

vi.mock("@/features/admin/utils/resolve-import-urls", () => ({
  importSingleLineWithProgress: vi.fn(),
}));

describe("AudioUploader", () => {
  let mockAudio: {
    src: string;
    duration: number;
    addEventListener: Mock<any>;
    removeEventListener: Mock<any>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => "mock-audio-url");
    global.URL.revokeObjectURL = vi.fn();

    // Mock HTML5 Audio for metadata extraction
    mockAudio = {
      src: "",
      duration: 180,
      addEventListener: vi.fn((event: string, callback: () => void) => {
        if (event === "loadedmetadata") {
          setTimeout(callback, 0);
        }
      }),
      removeEventListener: vi.fn(),
    };

    global.Audio = vi.fn().mockImplementation(function () {
      return mockAudio;
    }) as unknown as typeof Audio;
  });

  it("renders the dropzone area", () => {
    render(<AudioUploader onUploadComplete={vi.fn()} />);
    expect(screen.getByText(/drag & drop an audio file/i)).toBeInTheDocument();
    expect(screen.getByText(/or click to browse/i)).toBeInTheDocument();
  });

  it("handles file selection, extracts metadata, and performs upload", async () => {
    const onUploadCompleteMock = vi.fn();

    let resolvePresigned!: () => void;
    const presignedPromise = new Promise((resolve) => {
      resolvePresigned = () =>
        resolve({
          uploadUrl: "https://r2.storage/upload-url",
          publicUrl: "https://cdn.salafi-audios.com/audio/key.mp3",
          objectKey: "audio/key.mp3",
        });
    });

    (getPresignedUrl as Mock<any>).mockReturnValue(presignedPromise);
    (uploadToR2 as Mock<any>).mockResolvedValue(undefined);

    render(<AudioUploader onUploadComplete={onUploadCompleteMock} />);

    const file = new File(["dummy audio content"], "test-lecture.mp3", {
      type: "audio/mp3",
    });

    const fileInput = screen.getByTestId("audio-file-input");
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Should display uploading status since the presigned URL request is pending
    await waitFor(() => {
      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    });

    // Resolve the presigned URL promise
    resolvePresigned();

    // Should call getPresignedUrl with correct params
    await waitFor(() => {
      expect(getPresignedUrl).toHaveBeenCalledWith({
        filename: "test-lecture.mp3",
        contentType: "audio/mp3",
        purpose: "audio",
      });
    });

    // Should call uploadToR2 with correct params
    await waitFor(() => {
      expect(uploadToR2).toHaveBeenCalledWith(
        "https://r2.storage/upload-url",
        expect.any(File),
        "audio/mp3",
      );
    });

    // Should invoke callback with key and duration
    await waitFor(() => {
      expect(onUploadCompleteMock).toHaveBeenCalledWith({
        audioKey: "audio/key.mp3",
        durationSeconds: 180,
        sizeBytes: file.size,
        format: "audio/mp3",
        filename: "test-lecture.mp3",
      });
    });

    expect(screen.getByText(/upload complete/i)).toBeInTheDocument();
  });

  describe("paste link mode", () => {
    it("switches to a link input when 'Paste link' is clicked", () => {
      render(<AudioUploader onUploadComplete={vi.fn()} />);

      fireEvent.click(screen.getByRole("button", { name: /paste link/i }));

      expect(screen.getByPlaceholderText(/https:\/\//i)).toBeInTheDocument();
    });

    it("imports a file from a link and runs the normal upload pipeline", async () => {
      const onUploadCompleteMock = vi.fn();
      const importedFile = new File(["dummy audio content"], "Lesson.mp3", {
        type: "audio/mpeg",
      });

      (importSingleLineWithProgress as Mock<any>).mockResolvedValue({
        files: [importedFile],
        errors: [],
      });
      (getPresignedUrl as Mock<any>).mockResolvedValue({
        uploadUrl: "https://r2.storage/upload-url",
        publicUrl: "https://cdn.salafi-audios.com/audio/key.mp3",
        objectKey: "audio/key.mp3",
      });
      (uploadToR2 as Mock<any>).mockResolvedValue(undefined);

      render(<AudioUploader onUploadComplete={onUploadCompleteMock} />);

      fireEvent.click(screen.getByRole("button", { name: /paste link/i }));
      fireEvent.change(screen.getByPlaceholderText(/https:\/\//i), {
        target: { value: "https://archive.org/download/Item/Lesson.mp3" },
      });
      fireEvent.click(screen.getByRole("button", { name: /^import$/i }));

      await waitFor(() => {
        expect(importSingleLineWithProgress).toHaveBeenCalledWith(
          "https://archive.org/download/Item/Lesson.mp3",
          expect.any(Function),
        );
      });

      await waitFor(() => {
        expect(onUploadCompleteMock).toHaveBeenCalledWith({
          audioKey: "audio/key.mp3",
          durationSeconds: 180,
          sizeBytes: importedFile.size,
          format: "audio/mpeg",
          filename: "Lesson.mp3",
        });
      });
    });

    it("shows an error and does not upload when the link resolves to multiple files", async () => {
      (importSingleLineWithProgress as Mock<any>).mockResolvedValue({
        files: [
          new File(["a"], "one.mp3", { type: "audio/mpeg" }),
          new File(["b"], "two.mp3", { type: "audio/mpeg" }),
        ],
        errors: [],
      });

      render(<AudioUploader onUploadComplete={vi.fn()} />);

      fireEvent.click(screen.getByRole("button", { name: /paste link/i }));
      fireEvent.change(screen.getByPlaceholderText(/https:\/\//i), {
        target: { value: "https://archive.org/details/Item" },
      });
      fireEvent.click(screen.getByRole("button", { name: /^import$/i }));

      await waitFor(() => {
        expect(screen.getByText(/multiple files/i)).toBeInTheDocument();
      });
      expect(getPresignedUrl).not.toHaveBeenCalled();
    });

    it("surfaces the resolver's error message when the link can't be imported", async () => {
      (importSingleLineWithProgress as Mock<any>).mockResolvedValue({
        files: [],
        errors: [
          {
            input: "https://miraath.net/file.wav",
            message: "source blocks direct browser downloads",
          },
        ],
      });

      render(<AudioUploader onUploadComplete={vi.fn()} />);

      fireEvent.click(screen.getByRole("button", { name: /paste link/i }));
      fireEvent.change(screen.getByPlaceholderText(/https:\/\//i), {
        target: { value: "https://miraath.net/file.wav" },
      });
      fireEvent.click(screen.getByRole("button", { name: /^import$/i }));

      await waitFor(() => {
        expect(screen.getByText(/source blocks direct browser downloads/i)).toBeInTheDocument();
      });
    });

    it("shows byte-formatted download progress while importing a link", async () => {
      let capturedOnProgress: ((loaded: number, total: number | null) => void) | undefined;
      (importSingleLineWithProgress as Mock<any>).mockImplementation(
        (_url: string, onProgress: (loaded: number, total: number | null) => void) => {
          capturedOnProgress = onProgress;
          return new Promise(() => {}); // stays pending so we can inspect the mid-import UI
        },
      );

      render(<AudioUploader onUploadComplete={vi.fn()} />);

      fireEvent.click(screen.getByRole("button", { name: /paste link/i }));
      fireEvent.change(screen.getByPlaceholderText(/https:\/\//i), {
        target: { value: "https://archive.org/download/Item/Lesson.mp3" },
      });
      fireEvent.click(screen.getByRole("button", { name: /^import$/i }));

      await waitFor(() => expect(capturedOnProgress).toBeDefined());
      act(() => capturedOnProgress?.(48_000_000, 120_000_000));

      await waitFor(() => {
        expect(screen.getByText(/45\.8 MB \/ 114\.4 MB/)).toBeInTheDocument();
      });
    });
  });
});
