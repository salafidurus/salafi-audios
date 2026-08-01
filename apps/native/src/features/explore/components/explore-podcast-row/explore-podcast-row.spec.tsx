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

const mockIsSaved = jest.fn(() => false);
const mockAddSaved = jest.fn();
const mockRemoveSaved = jest.fn();

jest.mock("@sd/domain-audio", () => {
  const actual = jest.requireActual("@sd/domain-audio");
  return {
    ...actual,
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
    useProgressStore: jest.fn((selector: (state: unknown) => unknown) =>
      selector({
        actions: {
          isSaved: mockIsSaved,
          addSaved: mockAddSaved,
          removeSaved: mockRemoveSaved,
        },
        progressMap: {},
      }),
    ),
  };
});

jest.mock("@sd/core-contracts", () => ({
  httpClient: jest.fn(),
  endpoints: {
    listings: {
      contents: (id: string) => `/listings/${id}/contents`,
    },
  },
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

const mockUseFormattedScholarName = jest.fn(
  (scholarName: string, _scholarSlug?: string) => scholarName,
);

jest.mock("@sd/domain-content", () => ({
  useFormattedScholarName: (scholarName: string, scholarSlug: string) =>
    mockUseFormattedScholarName(scholarName, scholarSlug),
}));

describe("ExplorePodcastRow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title and scholar name", async () => {
    await render(<ExplorePodcastRow item={baseItem} />);
    expect(screen.getByText("Test Lecture")).toBeTruthy();
    expect(screen.getByText("Scholar Name")).toBeTruthy();
  });

  it("renders the scholar name with honorific title when available", async () => {
    mockUseFormattedScholarName.mockReturnValueOnce("Shaykh Scholar Name");
    await render(<ExplorePodcastRow item={baseItem} />);
    expect(mockUseFormattedScholarName).toHaveBeenCalledWith("Scholar Name", "scholar-name");
    expect(screen.getByText("Shaykh Scholar Name")).toBeTruthy();
  });

  it("keeps the raw scholar name as the Track artist when playing, not the honorific-prefixed name", async () => {
    mockUseFormattedScholarName.mockReturnValueOnce("Shaykh Scholar Name");
    const audioMock = jest.requireMock("@/features/audio").audioService;
    await render(<ExplorePodcastRow item={baseItem} />);
    await fireEvent.press(screen.getByTestId("podcast-row"));
    expect(audioMock.playListing).toHaveBeenCalledWith(
      expect.objectContaining({ artist: "Scholar Name", scholarSlug: "scholar-name" }),
      expect.anything(),
    );
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

  it("calls onNavigateToListing when the Details long-press menu action is pressed", async () => {
    const onNavigateToListing = jest.fn();
    await render(<ExplorePodcastRow item={baseItem} onNavigateToListing={onNavigateToListing} />);
    await fireEvent.press(screen.getByTestId("podcast-row-item-action-details"));
    expect(onNavigateToListing).toHaveBeenCalledWith("test-lecture");
  });

  it("saves the item when the Save long-press menu action is pressed", async () => {
    mockIsSaved.mockReturnValue(false);

    await render(<ExplorePodcastRow item={baseItem} />);
    await fireEvent.press(screen.getByTestId("podcast-row-item-action-save"));

    expect(mockAddSaved).toHaveBeenCalledWith(baseItem.id);
  });

  it("removes the item when the Save long-press menu action is pressed while already saved", async () => {
    mockIsSaved.mockReturnValue(true);

    await render(<ExplorePodcastRow item={baseItem} />);
    await fireEvent.press(screen.getByTestId("podcast-row-item-action-save"));

    expect(mockRemoveSaved).toHaveBeenCalledWith(baseItem.id);
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

  it("fetches contents and plays the full ordered queue starting at the first lesson for a series row", async () => {
    const audioMock = jest.requireMock("@/features/audio").audioService;
    const httpClientMock = jest.requireMock("@sd/core-contracts").httpClient;
    httpClientMock.mockResolvedValue({
      format: "series",
      items: [
        {
          id: "lesson-1",
          slug: "lesson-1",
          title: "Lesson 1",
          orderIndex: 0,
          primaryAudioAsset: { id: "a1", url: "https://s/lesson-1.mp3" },
        },
        {
          id: "lesson-2",
          slug: "lesson-2",
          title: "Lesson 2",
          orderIndex: 1,
          primaryAudioAsset: { id: "a2", url: "https://s/lesson-2.mp3" },
        },
      ],
    });

    const seriesItem: FeedContentItemDto = { ...baseItem, kind: "series" };
    await render(<ExplorePodcastRow item={seriesItem} />);
    await fireEvent.press(screen.getByTestId("podcast-row"));

    expect(httpClientMock).toHaveBeenCalledWith({
      url: "/listings/lec-1/contents",
      method: "GET",
    });
    const lastCall = audioMock.playListing.mock.calls.at(-1);
    const [playedTrack, playedQueue] = lastCall;
    expect(playedTrack.id).toBe("lesson-1");
    expect(playedQueue.map((t: { id: string }) => t.id)).toEqual(["lesson-1", "lesson-2"]);
  });

  it("falls back to a single-track play if fetching a series row's contents fails", async () => {
    const audioMock = jest.requireMock("@/features/audio").audioService;
    const httpClientMock = jest.requireMock("@sd/core-contracts").httpClient;
    httpClientMock.mockRejectedValue(new Error("network error"));

    const seriesItem: FeedContentItemDto = { ...baseItem, kind: "series" };
    await render(<ExplorePodcastRow item={seriesItem} />);
    await fireEvent.press(screen.getByTestId("podcast-row"));

    expect(audioMock.playListing).toHaveBeenCalledWith(
      expect.objectContaining({ id: "lec-1" }),
      expect.anything(),
    );
  });

  it("does not fetch contents for a single-format row", async () => {
    const httpClientMock = jest.requireMock("@sd/core-contracts").httpClient;

    await render(<ExplorePodcastRow item={baseItem} />);
    await fireEvent.press(screen.getByTestId("podcast-row"));

    expect(httpClientMock).not.toHaveBeenCalled();
  });
});
