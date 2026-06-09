import React from "react";
import renderer, { act } from "react-test-renderer";
import { AudioUploaderSheet } from "./AudioUploaderSheet";

jest.mock("expo-document-picker", () => ({ getDocumentAsync: jest.fn() }));
jest.mock("expo-file-system", () => {
  class MockFile {
    uri: string;
    constructor(uri: string) {
      this.uri = uri;
    }
  }
  class MockUploadTask {
    file: MockFile;
    url: string;
    options: Record<string, unknown>;
    constructor(file: MockFile, url: string, options: Record<string, unknown>) {
      this.file = file;
      this.url = url;
      this.options = options;
    }
    uploadAsync = jest.fn().mockResolvedValue({ status: 200 });
  }
  return {
    File: MockFile,
    UploadTask: MockUploadTask,
    UploadType: { BINARY_CONTENT: "BINARY_CONTENT" },
  };
});
jest.mock("expo-audio", () => ({
  createAudioPlayer: jest.fn(),
}));
jest.mock("@sd/domain-content", () => ({
  useScholarsList: () => ({
    data: {
      scholars: [
        { id: "sch-1", slug: "scholar-one", name: "Scholar One", isKibar: false, lectureCount: 1 },
      ],
    },
    isLoading: false,
  }),
}));
jest.mock("@/features/admin-lectures/api/admin-lectures.api", () => ({
  getPresignedUrl: jest.fn(),
  uploadToR2: jest.fn(),
  createLecture: jest.fn(),
}));

describe("AudioUploaderSheet", () => {
  it("renders Select Audio Files button when open", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <AudioUploaderSheet isOpen={true} onClose={() => {}} onUploadComplete={() => {}} />,
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain("Select Audio Files");
  });

  it("renders nothing when closed", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <AudioUploaderSheet isOpen={false} onClose={() => {}} onUploadComplete={() => {}} />,
      );
    });
    expect(tree!.toJSON()).toBeNull();
  });
});
