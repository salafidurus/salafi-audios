import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { useScholarsList } from "@sd/domain-content";
import { render, screen } from "@testing-library/react-native";
import React from "react";

import { AudioUploaderSheet } from "./AudioUploaderSheet";

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));
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
  useScholarsList: jest.fn(),
}));
jest.mock("@sd/domain-account", () => ({
  useAbility: jest.fn(),
}));
jest.mock("@/core/auth/use-auth", () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true, isLoading: false, user: undefined })),
}));
jest.mock("@/features/admin/api/admin-listings.api", () => ({
  getPresignedUrl: jest.fn(),
  uploadToR2: jest.fn(),
  createListing: jest.fn(),
}));

const mockUseScholarsList = jest.mocked(useScholarsList) as any;
const mockedUseAbility = jest.mocked(useAbility) as any;

describe("AudioUploaderSheet", () => {
  beforeEach(() => {
    mockUseScholarsList.mockReturnValue({
      data: {
        scholars: [
          { id: "sch-1", slug: "scholar-one", name: "Scholar One", lectureCount: 1 },
          { id: "sch-2", slug: "scholar-two", name: "Scholar Two", lectureCount: 2 },
        ],
      },
      isLoading: false,
    });
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([{ action: "upload", subject: "Media" }]),
      isLoading: false,
    });
  });

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

  it("shows every scholar when the ability grants unscoped upload access", async () => {
    await render(
      <AudioUploaderSheet isOpen={true} onClose={() => {}} onUploadComplete={() => {}} />,
    );
    expect(screen.getByText("Scholar One")).toBeTruthy();
    expect(screen.getByText("Scholar Two")).toBeTruthy();
  });

  it("only shows scholars the ability grants upload access to", async () => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([
        { action: "upload", subject: "Media", conditions: { scholarSlug: "scholar-one" } },
      ]),
      isLoading: false,
    });

    await render(
      <AudioUploaderSheet isOpen={true} onClose={() => {}} onUploadComplete={() => {}} />,
    );

    expect(screen.getByText("Scholar One")).toBeTruthy();
    expect(screen.queryByText("Scholar Two")).toBeNull();
  });
});
