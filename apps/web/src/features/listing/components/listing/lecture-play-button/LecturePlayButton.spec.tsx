import type { ListingContentsDto, ListingDetailDto } from "@sd/core-contracts";

import { usePlaybackStore } from "@sd/domain-audio";
import { useListingContents } from "@sd/domain-content";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import React from "react";

import { audioService } from "@/features/audio";

import { LecturePlayButton } from "./LecturePlayButton";

// useAudio/buildTrackQueue come from the real package — only the network-backed
// content fetch and the audio service side effects are mocked.
vi.mock("@sd/domain-content", () => ({
  useListingContents: vi.fn(),
}));

vi.mock("@/features/audio", () => ({
  audioService: {
    playListing: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  usePlaybackStore.getState().actions.stop();
  (useListingContents as Mock<any>).mockReturnValue({ data: undefined, isFetching: false });
});

const baseLecture: ListingDetailDto = {
  id: "lec-1",
  slug: "test-lecture",
  title: "Test Lecture",
  format: "single",
  scholar: { id: "sch-1", slug: "scholar", name: "Ibn Baz" },
  topics: [],
  primaryAudioAsset: null,
  seriesContext: null,
  rootListing: null,
};

describe("LecturePlayButton", () => {
  it("returns null when there is no primaryAudioAsset", () => {
    const { container } = render(<LecturePlayButton lecture={baseLecture} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders play button when primaryAudioAsset exists", () => {
    const lecture: ListingDetailDto = {
      ...baseLecture,
      primaryAudioAsset: { id: "asset-1", url: "https://example.com/audio.mp3" },
    };
    render(<LecturePlayButton lecture={lecture} />);
    expect(screen.getByText("▶ Play Lecture")).toBeInTheDocument();
  });

  it("calls playLecture() with correct Track shape when clicked and there is no series context", () => {
    const lecture: ListingDetailDto = {
      ...baseLecture,
      durationSeconds: 3600,
      primaryAudioAsset: {
        id: "asset-1",
        url: "https://example.com/audio.mp3",
        durationSeconds: 1800,
      },
    };
    render(<LecturePlayButton lecture={lecture} />);
    fireEvent.click(screen.getByText("▶ Play Lecture"));
    const expectedTrack = {
      id: "lec-1",
      title: "Test Lecture",
      artist: "Ibn Baz",
      url: "https://example.com/audio.mp3",
      durationSeconds: 1800,
      artworkUrl: undefined,
      seriesId: null,
      seriesTitle: null,
    };
    expect(audioService.playListing).toHaveBeenCalledWith(expectedTrack, [expectedTrack]);
  });

  it("plays the full ordered series queue when the series' contents have loaded", () => {
    const lecture: ListingDetailDto = {
      ...baseLecture,
      primaryAudioAsset: {
        id: "asset-1",
        url: "https://example.com/audio.mp3",
        durationSeconds: 1800,
      },
      seriesContext: {
        seriesId: "series-1",
        seriesTitle: "Islamic Jurisprudence",
        seriesSlug: "islamic-jurisprudence",
      },
    };
    const seriesContents: ListingContentsDto = {
      format: "series",
      items: [
        {
          id: "lec-1",
          slug: "test-lecture",
          title: "Test Lecture",
          orderIndex: 0,
          durationSeconds: 1800,
          primaryAudioAsset: { id: "asset-1", url: "https://example.com/audio.mp3" },
        },
        {
          id: "lec-2",
          slug: "lecture-2",
          title: "Lecture 2",
          orderIndex: 1,
          durationSeconds: 900,
          primaryAudioAsset: { id: "asset-2", url: "https://example.com/audio2.mp3" },
        },
        {
          id: "lec-3",
          slug: "lecture-3",
          title: "Lecture 3",
          orderIndex: 2,
          durationSeconds: 1200,
          primaryAudioAsset: { id: "asset-3", url: "https://example.com/audio3.mp3" },
        },
      ],
    };
    (useListingContents as Mock<any>).mockReturnValue({ data: seriesContents, isFetching: false });

    render(<LecturePlayButton lecture={lecture} />);
    fireEvent.click(screen.getByText("▶ Play Lecture"));

    expect(audioService.playListing).toHaveBeenCalledTimes(1);
    const [playedTrack, playedQueue] = (audioService.playListing as Mock<any>).mock.calls[0] as [
      { id: string },
      { id: string }[],
    ];
    expect(playedTrack.id).toBe("lec-1");
    // The full remaining series, not just a single lookahead track.
    expect(playedQueue.map((t) => t.id)).toEqual(["lec-1", "lec-2", "lec-3"]);
  });
});
