import { usePlaybackStore, type Track } from "@sd/domain-audio";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "bun:test";
import React from "react";

import { audioService } from "../audio-service";
import { PlaybackControls } from "./playback-controls";

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

vi.mock("../audio-service", () => ({
  audioService: {
    pause: vi.fn(),
    resume: vi.fn(),
    seek: vi.fn(),
    setSpeed: vi.fn(),
    skipToPrevious: vi.fn(),
    skipToNext: vi.fn(),
  },
}));

const trackA: Track = {
  id: "a",
  slug: "a-slug",
  title: "A",
  artist: "Scholar",
  url: "",
  durationSeconds: 100,
};
const trackB: Track = {
  id: "b",
  slug: "b-slug",
  title: "B",
  artist: "Scholar",
  url: "",
  durationSeconds: 100,
};

beforeEach(() => {
  vi.clearAllMocks();
  usePlaybackStore.getState().actions.stop();
});

describe("PlaybackControls", () => {
  it("renders nothing when there is no current track", () => {
    const { container } = render(<PlaybackControls />);
    expect(container.firstChild).toBeNull();
  });

  it("calls skipToPrevious when Previous is clicked", () => {
    usePlaybackStore.getState().actions.setCurrentTrack(trackA);

    render(<PlaybackControls />);
    fireEvent.click(screen.getByLabelText("Previous track"));

    expect(audioService.skipToPrevious).toHaveBeenCalled();
  });

  it("disables Next and does not call skipToNext when there is no next track in the queue", () => {
    usePlaybackStore.getState().actions.setCurrentTrack(trackA);

    render(<PlaybackControls />);
    const nextButton = screen.getByLabelText("Next track") as HTMLButtonElement;

    expect(nextButton.disabled).toBe(true);
    fireEvent.click(nextButton);
    expect(audioService.skipToNext).not.toHaveBeenCalled();
  });

  it("enables Next and calls skipToNext when a next track exists in the queue", () => {
    usePlaybackStore.getState().actions.setCurrentTrack(trackA);
    usePlaybackStore.getState().actions.setQueueState([trackA, trackB], 0);

    render(<PlaybackControls />);
    const nextButton = screen.getByLabelText("Next track") as HTMLButtonElement;

    expect(nextButton.disabled).toBe(false);
    fireEvent.click(nextButton);
    expect(audioService.skipToNext).toHaveBeenCalled();
  });
});
