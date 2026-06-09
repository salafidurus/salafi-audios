import React from "react";
import renderer, { act } from "react-test-renderer";
import { AudioUploaderSheet } from "./AudioUploaderSheet";

jest.mock("expo-document-picker", () => ({ getDocumentAsync: jest.fn() }));
jest.mock("expo-file-system", () => ({
  createUploadTask: jest.fn(),
  FileSystemUploadType: { BINARY_CONTENT: "BINARY_CONTENT" },
}));
jest.mock("expo-audio", () => ({
  createAudioPlayer: jest.fn(),
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
