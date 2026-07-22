import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ListingDetailDto } from "@sd/core-contracts";
import { LecturePlayButton } from "./LecturePlayButton";
import { useAudio } from "@sd/domain-audio";
import { audioService } from "@/features/audio";

vi.mock("@sd/domain-audio", () => ({
  useAudio: vi.fn(),
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
  (useAudio as Mock<any>).mockReturnValue({ isPlaying: false, currentTrack: null });
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

  it("calls playLecture() with correct Track shape when clicked", () => {
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

  it("passes series queueContext with lazy next-track stub when seriesContext has nextLecture", () => {
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
        prevLecture: null,
        nextLecture: { id: "lec-2", slug: "lecture-2", title: "Lecture 2" },
      },
    };
    render(<LecturePlayButton lecture={lecture} />);
    fireEvent.click(screen.getByText("▶ Play Lecture"));
    const mainTrack = {
      id: "lec-1",
      title: "Test Lecture",
      artist: "Ibn Baz",
      url: "https://example.com/audio.mp3",
      durationSeconds: 1800,
      artworkUrl: undefined,
      seriesId: "series-1",
      seriesTitle: "Islamic Jurisprudence",
    };
    const nextStub = {
      id: "lec-2",
      title: "Lecture 2",
      artist: "Ibn Baz",
      url: "",
      durationSeconds: 0,
      seriesId: "series-1",
      seriesTitle: "Islamic Jurisprudence",
    };
    expect(audioService.playListing).toHaveBeenCalledWith(mainTrack, [mainTrack, nextStub]);
  });
});
