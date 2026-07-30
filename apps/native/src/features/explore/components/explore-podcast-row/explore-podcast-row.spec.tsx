import type { FeedContentItemDto } from "@sd/core-contracts";

import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

import { ExplorePodcastRow } from "./explore-podcast-row";

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
  useAudio: jest.fn(() => ({
    isPlaying: false,
    currentTrack: null,
    playListing: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
  })),
  useProgressStore: jest.fn(() => ({
    actions: {
      isSaved: jest.fn(() => false),
      addSaved: jest.fn(),
      removeSaved: jest.fn(),
    },
    progressMap: {},
  })),
}));

jest.mock("@/features/audio", () => ({
  audioService: {
    playListing: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
  },
}));

jest.mock("@/features/settings/content-preference", () => ({
  useShowOriginalContent: jest.fn(() => false),
}));

jest.mock("@sd/core-i18n", () => ({
  pickContentField: jest.fn((t: string) => t),
}));

describe("ExplorePodcastRow", () => {
  it("renders title and scholar name", async () => {
    await render(<ExplorePodcastRow item={baseItem} />);
    expect(screen.getByText("Test Lecture")).toBeTruthy();
    expect(screen.getByText("Scholar Name")).toBeTruthy();
  });

  it("shows duration in minutes", async () => {
    await render(<ExplorePodcastRow item={baseItem} />);
    expect(screen.getByText(/30 min/)).toBeTruthy();
  });

  it("hides duration when durationSeconds is null", async () => {
    await render(<ExplorePodcastRow item={{ ...baseItem, durationSeconds: null }} />);
    expect(screen.queryByText(/30 min/)).toBeNull();
  });

  it("triggers play when row item is pressed", async () => {
    const audioMock = jest.requireMock("@/features/audio").audioService;
    await render(<ExplorePodcastRow item={baseItem} />);
    await fireEvent.press(screen.getByTestId("podcast-row"));
    expect(audioMock.playListing).toHaveBeenCalled();
  });

  it("calls onNavigateToListing when details action button is pressed", async () => {
    const onNavigateToListing = jest.fn();
    await render(<ExplorePodcastRow item={baseItem} onNavigateToListing={onNavigateToListing} />);
    await fireEvent.press(screen.getByTestId("details-action"));
    expect(onNavigateToListing).toHaveBeenCalledWith("test-lecture");
  });

  it("shows progress bar when 0 < progressPercent < 100", async () => {
    const mock = jest.requireMock("@sd/domain-audio").useListingProgress;
    mock.mockReturnValue({
      progressPercent: 40,
      resumePositionSeconds: 720,
      isCompleted: false,
    });
    await render(<ExplorePodcastRow item={baseItem} />);
    expect(screen.getByTestId("progress-bar-track")).toBeTruthy();
  });

  it("hides progress bar when progressPercent is 0", async () => {
    const mock = jest.requireMock("@sd/domain-audio").useListingProgress;
    mock.mockReturnValue({
      progressPercent: 0,
      resumePositionSeconds: 0,
      isCompleted: false,
    });
    await render(<ExplorePodcastRow item={baseItem} />);
    expect(screen.queryByTestId("progress-bar-track")).toBeNull();
  });
});
