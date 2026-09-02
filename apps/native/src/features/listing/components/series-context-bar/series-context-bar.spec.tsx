import type { SeriesContextDto } from "@sd/core-contracts";
import type { Track } from "@sd/domain-audio";

import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { SeriesContextBar } from "./series-context-bar";

jest.mock("@sd/domain-audio", () => ({
  useQueue: jest.fn(),
}));

jest.mock("@/features/audio", () => ({
  audioService: {
    skipToNext: jest.fn(),
    skipToPrevious: jest.fn(),
  },
}));

const { useQueue } = jest.requireMock("@sd/domain-audio");
const { audioService } = jest.requireMock("@/features/audio");

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
  jest.clearAllMocks();
});

describe("SeriesContextBar", () => {
  it("renders the series title", async () => {
    useQueue.mockReturnValue({
      queue: [],
      currentIndex: -1,
      currentTrack: null,
      hasNext: false,
      hasPrevious: false,
    });

    await render(<SeriesContextBar seriesContext={seriesContext} listingSlug="lec-b-slug" />);

    expect(screen.getByText("Islamic Jurisprudence")).toBeTruthy();
  });

  it("shows no nav rows when the active queue is for a different lesson", async () => {
    useQueue.mockReturnValue({
      queue: [trackA, trackB, trackC],
      currentIndex: 1,
      currentTrack: trackA,
      hasNext: true,
      hasPrevious: true,
    });

    await render(<SeriesContextBar seriesContext={seriesContext} listingSlug="lec-b-slug" />);

    expect(screen.queryByText(/Lesson A/)).toBeNull();
    expect(screen.queryByText(/Lesson C/)).toBeNull();
  });

  it("shows and wires Previous/Next when the active queue matches this lesson", async () => {
    useQueue.mockReturnValue({
      queue: [trackA, trackB, trackC],
      currentIndex: 1,
      currentTrack: trackB,
      hasNext: true,
      hasPrevious: true,
    });

    await render(<SeriesContextBar seriesContext={seriesContext} listingSlug="lec-b-slug" />);

    await fireEvent.press(screen.getByText(/Lesson A/));
    expect(audioService.skipToPrevious).toHaveBeenCalled();

    await fireEvent.press(screen.getByText(/Lesson C/));
    expect(audioService.skipToNext).toHaveBeenCalled();
  });
});
