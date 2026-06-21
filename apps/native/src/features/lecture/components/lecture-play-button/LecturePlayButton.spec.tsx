import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import type { LectureDetailDto } from "@sd/core-contracts";
import { LecturePlayButton } from "./LecturePlayButton";
import { useAudio } from "@sd/domain-audio";
import { audioService } from "@/features/audio";

jest.mock("@sd/domain-audio", () => ({ useAudio: jest.fn() }));
jest.mock("@/features/audio", () => ({
  audioService: {
    playLecture: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
  },
}));

jest.mock("../../../../shared/components/Button/Button", () => ({
  Button: ({ label, onPress }: { label: string; onPress: () => void }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return React.createElement(
      "View",
      { testID: label, onPress },
      React.createElement(Text, null, label),
    );
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  (useAudio as jest.Mock).mockReturnValue({ isPlaying: false, currentTrack: null });
});

const baseLecture: LectureDetailDto = {
  id: "lec-1",
  slug: "test-lecture",
  title: "Test Lecture",
  scholar: { id: "sch-1", slug: "scholar", name: "Ibn Baz" },
  topics: [],
  primaryAudioAsset: null,
  seriesContext: null,
};

describe("LecturePlayButton", () => {
  it("returns null when there is no primaryAudioAsset", async () => {
    await render(<LecturePlayButton lecture={baseLecture} />);
    expect(screen.toJSON()).toBeNull();
  });

  it("renders play button when primaryAudioAsset exists", async () => {
    const lecture: LectureDetailDto = {
      ...baseLecture,
      primaryAudioAsset: { id: "asset-1", url: "https://example.com/audio.mp3" },
    };
    await render(<LecturePlayButton lecture={lecture} />);
    expect(screen.getByTestId("▶ Play Lecture")).toBeTruthy();
  });

  it("calls playLecture() with correct Track shape when pressed", async () => {
    const lecture: LectureDetailDto = {
      ...baseLecture,
      durationSeconds: 3600,
      primaryAudioAsset: {
        id: "asset-1",
        url: "https://example.com/audio.mp3",
        durationSeconds: 1800,
      },
    };
    await render(<LecturePlayButton lecture={lecture} />);
    await fireEvent.press(screen.getByTestId("▶ Play Lecture"));
    const expectedTrack = {
      id: "asset-1",
      title: "Test Lecture",
      artist: "Ibn Baz",
      url: "https://example.com/audio.mp3",
      durationSeconds: 1800,
      artworkUrl: undefined,
      seriesId: null,
      seriesTitle: null,
    };
    expect(audioService.playLecture).toHaveBeenCalledWith(expectedTrack, [expectedTrack]);
  });

  it("passes series queueContext with lazy next-track stub when seriesContext has nextLecture", async () => {
    const lecture: LectureDetailDto = {
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
    await render(<LecturePlayButton lecture={lecture} />);
    await fireEvent.press(screen.getByTestId("▶ Play Lecture"));
    const mainTrack = {
      id: "asset-1",
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
    expect(audioService.playLecture).toHaveBeenCalledWith(mainTrack, [mainTrack, nextStub]);
  });
});
