import type { ListingContentsDto, ListingDetailDto } from "@sd/core-contracts";

import { usePlaybackStore } from "@sd/domain-audio";
import { useLastPlayedLesson } from "@sd/domain-content";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import React from "react";

import { useAuth } from "@/core/auth";
import { audioService } from "@/features/audio";

import { QuickButtonSection } from "./QuickButtonSection";

vi.mock("@sd/domain-content", () => ({
  useLastPlayedLesson: vi.fn(),
}));

vi.mock("@/core/auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/features/audio", () => ({
  audioService: {
    playListing: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  },
}));

vi.mock("../lecture-save-button/LectureSaveButton", () => ({
  LectureSaveButton: () => null,
}));

const seriesListing: ListingDetailDto = {
  id: "series-1",
  slug: "series-1",
  title: "Kitab at-Tawhid",
  format: "series",
  scholar: { id: "sch-1", slug: "scholar", name: "Ibn Baz" },
  topics: [],
  primaryAudioAsset: null,
  seriesContext: null,
};

const seriesContents: ListingContentsDto = {
  format: "series",
  items: [
    {
      id: "l1",
      slug: "l1",
      title: "Lesson 1",
      orderIndex: 0,
      primaryAudioAsset: { id: "a1", url: "https://s/l1.mp3" },
    },
    {
      id: "l2",
      slug: "l2",
      title: "Lesson 2",
      orderIndex: 1,
      primaryAudioAsset: { id: "a2", url: "https://s/l2.mp3" },
    },
    {
      id: "l3",
      slug: "l3",
      title: "Lesson 3",
      orderIndex: 2,
      primaryAudioAsset: { id: "a3", url: "https://s/l3.mp3" },
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  usePlaybackStore.getState().actions.stop();
  (useAuth as Mock<any>).mockReturnValue({ isAuthenticated: true });
  (useLastPlayedLesson as Mock<any>).mockReturnValue({ data: null });
});

describe("QuickButtonSection", () => {
  it('shows "Play All" and plays the full queue from the first track when there is no prior progress', () => {
    render(<QuickButtonSection listing={seriesListing} contents={seriesContents} />);

    fireEvent.click(screen.getByText("Play All"));

    const [track, queue] = (audioService.playListing as Mock<any>).mock.calls[0] as [
      { id: string; url: string },
      { id: string; url: string }[],
    ];
    expect(track.id).toBe("l1");
    expect(track.url).toBe("https://s/l1.mp3");
    expect(queue.map((t) => t.id)).toEqual(["l1", "l2", "l3"]);
  });

  it("resumes at the last-played lesson, resolving that track's URL eagerly instead of the first track's", () => {
    (useLastPlayedLesson as Mock<any>).mockReturnValue({
      data: {
        listingId: "l2",
        positionSeconds: 30,
        isCompleted: false,
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    render(<QuickButtonSection listing={seriesListing} contents={seriesContents} />);

    fireEvent.click(screen.getByText("Continue Playing"));

    const [track, queue] = (audioService.playListing as Mock<any>).mock.calls[0] as [
      { id: string; url: string },
      { id: string; url: string }[],
    ];
    expect(track.id).toBe("l2");
    expect(track.url).toBe("https://s/l2.mp3");
    // The queue itself is still the full ordered series...
    expect(queue.map((t) => t.id)).toEqual(["l1", "l2", "l3"]);
    // ...but only the resumed track got its URL eagerly resolved, not the first.
    expect(queue.find((t) => t.id === "l1")?.url).toBe("");
    expect(queue.find((t) => t.id === "l2")?.url).toBe("https://s/l2.mp3");
  });

  it('"Play from Start" always plays from the first track, ignoring prior progress', () => {
    (useLastPlayedLesson as Mock<any>).mockReturnValue({
      data: {
        listingId: "l2",
        positionSeconds: 30,
        isCompleted: false,
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    render(<QuickButtonSection listing={seriesListing} contents={seriesContents} />);

    fireEvent.click(screen.getByText("Play from Start"));

    const [track] = (audioService.playListing as Mock<any>).mock.calls[0] as [{ id: string }];
    expect(track.id).toBe("l1");
  });

  it("toggles pause/resume instead of rebuilding the queue when this listing is already playing", () => {
    usePlaybackStore.getState().actions.setCurrentTrack({
      id: "l1",
      title: "Lesson 1",
      artist: "Ibn Baz",
      url: "https://s/l1.mp3",
      durationSeconds: 100,
      seriesId: "series-1",
    });
    usePlaybackStore.getState().actions.setStatus("playing");

    render(<QuickButtonSection listing={seriesListing} contents={seriesContents} />);

    fireEvent.click(screen.getByText("Pause"));

    expect(audioService.pause).toHaveBeenCalled();
    expect(audioService.playListing).not.toHaveBeenCalled();
  });
});
