import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import type { FeedContentItemDto } from "@sd/core-contracts";
import { FeedPodcastRow } from "./feed-podcast-row";

const baseItem: FeedContentItemDto = {
  kind: "single",
  id: "lec-1",
  title: "Test Lecture",
  slug: "test-lecture",
  scholarName: "Scholar Name",
  scholarSlug: "scholar-name",
  thumbnailUrl: null,
  durationSeconds: 1800,
  publishedAt: "2026-06-20T10:00:00Z",
};

jest.mock("@sd/domain-audio", () => ({
  useListingProgress: jest.fn(() => ({
    progressPercent: 0,
    resumePositionSeconds: 0,
    isCompleted: false,
  })),
}));

jest.mock("@/features/settings/content-preference", () => ({
  useShowOriginalContent: jest.fn(() => false),
}));

jest.mock("@sd/core-i18n", () => ({
  pickContentField: jest.fn((t: string) => t),
}));

describe("FeedPodcastRow", () => {
  it("renders title and scholar name", async () => {
    await render(<FeedPodcastRow item={baseItem} />);
    expect(screen.getByText("Test Lecture")).toBeTruthy();
    expect(screen.getByText("Scholar Name")).toBeTruthy();
  });

  it("shows duration in minutes", async () => {
    await render(<FeedPodcastRow item={baseItem} />);
    expect(screen.getByText("30 min")).toBeTruthy();
  });

  it("hides duration when durationSeconds is null", async () => {
    await render(<FeedPodcastRow item={{ ...baseItem, durationSeconds: null }} />);
    expect(screen.queryByText("30 min")).toBeNull();
  });

  it("renders thumbnail image when thumbnailUrl is provided", async () => {
    await render(
      <FeedPodcastRow item={{ ...baseItem, thumbnailUrl: "https://example.com/thumb.jpg" }} />,
    );
    expect(screen.getByTestId("podcast-thumbnail")).toBeTruthy();
  });

  it("renders placeholder view when no thumbnailUrl", async () => {
    await render(<FeedPodcastRow item={baseItem} />);
    expect(screen.getByTestId("podcast-thumbnail-placeholder")).toBeTruthy();
  });

  it("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    await render(<FeedPodcastRow item={baseItem} onPress={onPress} />);
    await fireEvent.press(screen.getByTestId("podcast-row"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows progress bar when 0 < progressPercent < 100", async () => {
    const mock = jest.requireMock("@sd/domain-audio").useListingProgress;
    mock.mockReturnValue({
      progressPercent: 40,
      resumePositionSeconds: 720,
      isCompleted: false,
    });
    await render(<FeedPodcastRow item={baseItem} />);
    expect(screen.getByTestId("progress-bar-track")).toBeTruthy();
  });

  it("hides progress bar when progressPercent is 0", async () => {
    const mock = jest.requireMock("@sd/domain-audio").useListingProgress;
    mock.mockReturnValue({
      progressPercent: 0,
      resumePositionSeconds: 0,
      isCompleted: false,
    });
    await render(<FeedPodcastRow item={baseItem} />);
    expect(screen.queryByTestId("progress-bar-track")).toBeNull();
  });

  it("hides progress bar when item is completed (progressPercent 100)", async () => {
    const mock = jest.requireMock("@sd/domain-audio").useListingProgress;
    mock.mockReturnValue({
      progressPercent: 100,
      resumePositionSeconds: 1800,
      isCompleted: true,
    });
    await render(<FeedPodcastRow item={baseItem} />);
    expect(screen.queryByTestId("progress-bar-track")).toBeNull();
  });

  it("shows listing type when not a single", async () => {
    await render(<FeedPodcastRow item={{ ...baseItem, kind: "series" }} />);
    expect(screen.getByText("Scholar Name · series")).toBeTruthy();
  });
});
