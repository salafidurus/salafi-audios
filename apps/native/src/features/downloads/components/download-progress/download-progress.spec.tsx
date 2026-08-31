import { render, screen } from "@testing-library/react-native";
import React from "react";

import { DownloadProgress } from "./download-progress";

jest.mock("@/features/downloads/hooks/use-download", () => ({
  useDownload: jest.fn(),
}));

const { useDownload } = jest.requireMock("@/features/downloads/hooks/use-download");

describe("DownloadProgress", () => {
  it("renders rounded active progress", async () => {
    useDownload.mockReturnValue({ isDownloading: true, progress: 42.4 });

    await render(<DownloadProgress listingSlug="lesson-1" />);

    expect(screen.getByText(/42/)).toBeTruthy();
  });

  it("renders nothing outside an active download", async () => {
    useDownload.mockReturnValue({ isDownloading: false, progress: 100 });

    const { toJSON } = await render(<DownloadProgress listingSlug="lesson-1" />);
    expect(toJSON()).toBeNull();
  });
});
