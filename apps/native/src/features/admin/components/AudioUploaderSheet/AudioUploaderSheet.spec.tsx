import React from "react";
import { render, screen } from "@testing-library/react-native";
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
      scholars: [{ id: "sch-1", slug: "scholar-one", name: "Scholar One", lectureCount: 1 }],
    },
    isLoading: false,
  }),
}));
jest.mock("@/features/admin/api/admin-lectures.api", () => ({
  getPresignedUrl: jest.fn(),
  uploadToR2: jest.fn(),
  createLecture: jest.fn(),
}));

describe("AudioUploaderSheet", () => {
  it("renders Select Audio Files button when open", async () => {
    await render(
      <AudioUploaderSheet isOpen={true} onClose={() => {}} onUploadComplete={() => {}} />,
    );
    expect(screen.getByText("Select Audio Files")).toBeTruthy();
  });

  it("renders nothing when closed", async () => {
    await render(
      <AudioUploaderSheet isOpen={false} onClose={() => {}} onUploadComplete={() => {}} />,
    );
    expect(screen.toJSON()).toBeNull();
  });
});
