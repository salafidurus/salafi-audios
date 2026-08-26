import type { SeriesContextDto } from "@sd/core-contracts";
import type { Track } from "@sd/domain-audio";

import { useQueue } from "@sd/domain-audio";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "bun:test";
import React from "react";

import { audioService } from "@/features/audio";

import { SeriesContextBar } from "./series-context-bar";

vi.mock("@sd/domain-audio", () => ({
  useQueue: vi.fn(),
}));

vi.mock("@/features/audio", () => ({
  audioService: {
    skipToNext: vi.fn(),
    skipToPrevious: vi.fn(),
  },
}));

const seriesContext: SeriesContextDto = {
  seriesId: "series-1",
  seriesTitle: "Islamic Jurisprudence",
  seriesSlug: "islamic-jurisprudence",
};

const trackA: Track = {
  id: "lec-a",
  slug: "lec-a-slug",
  title: "Lesson A",
  artist: "Scholar",
  url: "",
  durationSeconds: 0,
};
const trackB: Track = {
  id: "lec-b",
  slug: "lec-b-slug",
  title: "Lesson B",
  artist: "Scholar",
  url: "",
  durationSeconds: 0,
};
const trackC: Track = {
  id: "lec-c",
  slug: "lec-c-slug",
  title: "Lesson C",
  artist: "Scholar",
  url: "",
  durationSeconds: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("SeriesContextBar", () => {
  it("renders the series title", () => {
    (useQueue as Mock<any>).mockReturnValue({
      queue: [],
      currentIndex: -1,
      currentTrack: null,
      hasNext: false,
      hasPrevious: false,
    });

    render(<SeriesContextBar seriesContext={seriesContext} listingSlug="lec-b-slug" />);

    expect(screen.getByText("Islamic Jurisprudence")).toBeInTheDocument();
  });

  it("shows no nav buttons when the active queue is for a different lesson", () => {
    (useQueue as Mock<any>).mockReturnValue({
      queue: [trackA, trackB, trackC],
      currentIndex: 1,
      currentTrack: trackA, // playing a different lesson than the one being viewed
      hasNext: true,
      hasPrevious: true,
    });

    render(<SeriesContextBar seriesContext={seriesContext} listingSlug="lec-b-slug" />);

    expect(screen.queryByText("Lesson A")).not.toBeInTheDocument();
    expect(screen.queryByText("Lesson C")).not.toBeInTheDocument();
  });

  it("shows Previous and Next with correct titles when the active queue matches this lesson", () => {
    (useQueue as Mock<any>).mockReturnValue({
      queue: [trackA, trackB, trackC],
      currentIndex: 1,
      currentTrack: trackB,
      hasNext: true,
      hasPrevious: true,
    });

    render(<SeriesContextBar seriesContext={seriesContext} listingSlug="lec-b-slug" />);

    expect(screen.getByText("Lesson A")).toBeInTheDocument();
    expect(screen.getByText("Lesson C")).toBeInTheDocument();
  });

  it("calls audioService.skipToPrevious() when Previous is clicked", () => {
    (useQueue as Mock<any>).mockReturnValue({
      queue: [trackA, trackB, trackC],
      currentIndex: 1,
      currentTrack: trackB,
      hasNext: true,
      hasPrevious: true,
    });

    render(<SeriesContextBar seriesContext={seriesContext} listingSlug="lec-b-slug" />);
    fireEvent.click(screen.getByText("Lesson A"));

    expect(audioService.skipToPrevious).toHaveBeenCalled();
  });

  it("calls audioService.skipToNext() when Next is clicked", () => {
    (useQueue as Mock<any>).mockReturnValue({
      queue: [trackA, trackB, trackC],
      currentIndex: 1,
      currentTrack: trackB,
      hasNext: true,
      hasPrevious: true,
    });

    render(<SeriesContextBar seriesContext={seriesContext} listingSlug="lec-b-slug" />);
    fireEvent.click(screen.getByText("Lesson C"));

    expect(audioService.skipToNext).toHaveBeenCalled();
  });

  it("hides Previous when at the start of the active queue", () => {
    (useQueue as Mock<any>).mockReturnValue({
      queue: [trackA, trackB],
      currentIndex: 0,
      currentTrack: trackA,
      hasNext: true,
      hasPrevious: false,
    });

    render(<SeriesContextBar seriesContext={seriesContext} listingSlug="lec-a-slug" />);

    expect(screen.queryByText(/Previous/)).not.toBeInTheDocument();
    expect(screen.getByText("Lesson B")).toBeInTheDocument();
  });
});
