import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AudioUploader } from "./AudioUploader";
import { getPresignedUrl, uploadToR2 } from "../../api/admin-lectures.api";

jest.mock("../../api/admin-lectures.api", () => ({
  getPresignedUrl: jest.fn(),
  uploadToR2: jest.fn(),
}));

describe("AudioUploader", () => {
  let mockAudio: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => "mock-audio-url");
    global.URL.revokeObjectURL = jest.fn();

    // Mock HTML5 Audio for metadata extraction
    mockAudio = {
      src: "",
      duration: 180,
      addEventListener: jest.fn((event, callback) => {
        if (event === "loadedmetadata") {
          setTimeout(callback, 0);
        }
      }),
      removeEventListener: jest.fn(),
    };

    global.Audio = jest.fn(() => mockAudio) as any;
  });

  it("renders the dropzone area", () => {
    render(<AudioUploader onUploadComplete={jest.fn()} />);
    expect(screen.getByText(/drag & drop an audio file/i)).toBeInTheDocument();
    expect(screen.getByText(/or click to browse/i)).toBeInTheDocument();
  });

  it("handles file selection, extracts metadata, and performs upload", async () => {
    const onUploadCompleteMock = jest.fn();

    let resolvePresigned: any;
    const presignedPromise = new Promise((resolve) => {
      resolvePresigned = () =>
        resolve({
          uploadUrl: "https://r2.storage/upload-url",
          publicUrl: "https://cdn.salafi-audios.com/audio/key.mp3",
          objectKey: "audio/key.mp3",
        });
    });

    (getPresignedUrl as jest.Mock).mockReturnValue(presignedPromise);
    (uploadToR2 as jest.Mock).mockResolvedValue(undefined);

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
});
