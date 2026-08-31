import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { DownloadButton } from "./download-button";

jest.mock("@/features/downloads/hooks/use-download", () => ({
  useDownload: jest.fn(),
}));

const { useDownload } = jest.requireMock("@/features/downloads/hooks/use-download");

describe("DownloadButton", () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    ["idle", "↓ Download", "download-lecture"],
    ["error", "⚠ Retry", "download-lecture"],
  ] as const)("renders the %s action", async (status, label, testID) => {
    const startDownload = jest.fn();
    useDownload.mockReturnValue({
      status,
      isDownloaded: false,
      isDownloading: false,
      startDownload,
      removeDownload: jest.fn(),
    });

    await render(<DownloadButton listingSlug="lesson-1" audioUrl="https://example.test/a.mp3" />);
    expect(screen.getByText(label)).toBeTruthy();
    await fireEvent.press(screen.getByTestId(testID));
    expect(startDownload).toHaveBeenCalled();
  });

  it("renders an active download as non-interactive progress", async () => {
    useDownload.mockReturnValue({
      status: "downloading",
      isDownloaded: false,
      isDownloading: true,
      removeDownload: jest.fn(),
      startDownload: jest.fn(),
    });

    await render(<DownloadButton listingSlug="lesson-1" audioUrl="https://example.test/a.mp3" />);
    expect(screen.getByText("Downloading")).toBeTruthy();
    expect(screen.queryByTestId("download-lecture")).toBeNull();
  });

  it("removes a completed download", async () => {
    const removeDownload = jest.fn();
    useDownload.mockReturnValue({
      status: "complete",
      isDownloaded: true,
      isDownloading: false,
      removeDownload,
      startDownload: jest.fn(),
    });

    await render(<DownloadButton listingSlug="lesson-1" audioUrl="https://example.test/a.mp3" />);
    await fireEvent.press(screen.getByTestId("remove-download"));
    expect(removeDownload).toHaveBeenCalled();
  });
});
