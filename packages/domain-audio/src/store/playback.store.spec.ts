import { describe, it, expect, beforeEach } from "bun:test";

import type { Track } from "../types/track.types";

import { usePlaybackStore } from "./playback.store";

describe("usePlaybackStore queue state", () => {
  const mockTrack: Track = {
    id: "t1",
    title: "Track 1",
    artist: "Scholar 1",
    url: "https://test.mp3",
    durationSeconds: 600,
  };

  beforeEach(() => {
    usePlaybackStore.getState().actions.stop();
  });

  it("defaults to an empty queue and no current index", () => {
    expect(usePlaybackStore.getState().queue).toEqual([]);
    expect(usePlaybackStore.getState().currentIndex).toBe(-1);
  });

  it("updates queue and currentIndex via setQueueState", () => {
    usePlaybackStore.getState().actions.setQueueState([mockTrack], 0);

    expect(usePlaybackStore.getState().queue).toEqual([mockTrack]);
    expect(usePlaybackStore.getState().currentIndex).toBe(0);
  });

  it("resets queue and currentIndex on stop()", () => {
    usePlaybackStore.getState().actions.setQueueState([mockTrack], 0);
    usePlaybackStore.getState().actions.stop();

    expect(usePlaybackStore.getState().queue).toEqual([]);
    expect(usePlaybackStore.getState().currentIndex).toBe(-1);
  });
});
