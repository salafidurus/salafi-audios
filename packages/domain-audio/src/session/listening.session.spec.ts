import { describe, expect, it, vi } from "bun:test";

import type { PlaybackEngine, PlaybackEngineEvents } from "../engine/playback.engine";
import type { Track } from "../types/track.types";

import { useProgressStore } from "../progress/progress.store";
import { ListeningSession } from "./listening.session";

vi.mock("../progress/progress.sync", () => ({
  syncProgressToBackend: vi.fn(),
  flushPendingProgress: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
}));

const track: Track = {
  id: "track-1",
  slug: "track-one",
  title: "Track 1",
  artist: "Scholar",
  url: "https://example.test/track.mp3",
  durationSeconds: 60,
};

function createEngine() {
  let events: PlaybackEngineEvents = {};
  const engine = {
    setup: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    load: vi.fn<(value: Track) => Promise<void>>().mockResolvedValue(undefined),
    play: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    pause: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    seek: vi.fn<(value: number) => Promise<void>>().mockResolvedValue(undefined),
    setSpeed: vi.fn<(value: number) => Promise<void>>().mockResolvedValue(undefined),
    stop: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    destroy: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    setEvents: vi.fn<(value: PlaybackEngineEvents) => void>((value) => {
      events = value;
    }),
  } as unknown as PlaybackEngine;

  return { engine, events: () => events };
}

describe("ListeningSession", () => {
  it("completes only after natural end, while stopping does not complete", async () => {
    useProgressStore.setState({ progressMap: {}, lastSyncedAt: null });
    const { engine, events } = createEngine();
    const session = new ListeningSession(engine);

    await session.playListing(track);
    await session.stop();
    expect(useProgressStore.getState().progressMap[track.slug]?.completedAt).toBeUndefined();

    await session.playListing(track);
    await events().onTrackEnd?.();
    expect(useProgressStore.getState().progressMap[track.slug]?.completedAt).toBeDefined();
  });
});
