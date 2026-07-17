import { vi, describe, it, expect, beforeEach } from "bun:test";
import { DurusAudioService } from "./audio.service";
import type { PlaybackEngine, PlaybackEngineEvents } from "../engine/playback.engine";
import { usePlaybackStore } from "../store/playback.store";
import { useProgressStore } from "../progress/progress.store";
import type { Track } from "../types/track.types";

// Mock progress sync module to avoid network triggers in tests
vi.mock("../progress/progress.sync", () => ({
  syncProgressToBackend: vi.fn<() => void>(),
  syncLocalToServer: vi.fn<() => void>(),
  saveListing: vi.fn<() => void>(),
  unsaveListing: vi.fn<() => void>(),
}));

// Mock httpClient used for lazy stream URL resolution
vi.mock("@sd/core-contracts", () => ({
  httpClient: vi.fn<() => Promise<{ url: string }>>(),
  endpoints: {
    audio: {
      listings: {
        stream: (id: string) => `/audio/listings/${id}/stream`,
      },
    },
  },
}));

import { syncProgressToBackend } from "../progress/progress.sync";
import { httpClient } from "@sd/core-contracts";

describe("DurusAudioService", () => {
  let service: DurusAudioService;
  let mockEngine: PlaybackEngine;
  let engineEvents: PlaybackEngineEvents;

  const mockTrack: Track = {
    id: "l1",
    title: "Lecture 1",
    artist: "Scholar 1",
    url: "https://stream.mp3",
    durationSeconds: 1800,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    usePlaybackStore.getState().actions.stop();
    (httpClient as any).mockResolvedValue({ url: "https://resolved.stream.mp3" });

    mockEngine = {
      setup: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
      load: vi.fn<(track: Track) => Promise<void>>().mockResolvedValue(undefined),
      play: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
      pause: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
      seek: vi.fn<(seconds: number) => Promise<void>>().mockResolvedValue(undefined),
      setSpeed: vi.fn<(speed: number) => Promise<void>>().mockResolvedValue(undefined),
      stop: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
      destroy: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
      setEvents: vi.fn<(events: PlaybackEngineEvents) => void>().mockImplementation((ev) => {
        engineEvents = ev;
      }),
    } as unknown as PlaybackEngine;

    service = new DurusAudioService(mockEngine);
  });

  it("should register engine events on instantiation", () => {
    expect(mockEngine.setEvents).toHaveBeenCalled();
    expect(engineEvents.onPositionChange).toBeDefined();
    expect(engineEvents.onTrackEnd).toBeDefined();
  });

  it("should play listing and load in engine", async () => {
    await service.playListing(mockTrack);

    expect(usePlaybackStore.getState().currentTrack).toEqual(mockTrack);
    expect(mockEngine.load).toHaveBeenCalledWith(mockTrack);
    expect(mockEngine.play).toHaveBeenCalled();
  });

  it("should pause playback", async () => {
    await service.pause();
    expect(mockEngine.pause).toHaveBeenCalled();
  });

  it("should resume playback", async () => {
    await service.resume();
    expect(mockEngine.play).toHaveBeenCalled();
  });

  it("should seek to correct coordinate", async () => {
    await service.seek(500);
    expect(mockEngine.seek).toHaveBeenCalledWith(500);
  });

  it("should change speed correctly", async () => {
    await service.setSpeed(1.5);
    expect(mockEngine.setSpeed).toHaveBeenCalledWith(1.5);
    expect(usePlaybackStore.getState().speed).toBe(1.5);
  });

  it("should stop playback and clear state", async () => {
    await service.playListing(mockTrack);
    await service.stop();

    expect(mockEngine.stop).toHaveBeenCalled();
    expect(usePlaybackStore.getState().currentTrack).toBeNull();
    expect(usePlaybackStore.getState().status).toBe("idle");
  });

  it("should record progress and debounce sync on position change", () => {
    usePlaybackStore.getState().actions.setCurrentTrack(mockTrack);
    usePlaybackStore.getState().actions.setDuration(1800);

    engineEvents.onPositionChange!(90);

    expect(usePlaybackStore.getState().positionSeconds).toBe(90);
    expect(useProgressStore.getState().progressMap[mockTrack.id]).toBeDefined();
    expect(useProgressStore.getState().progressMap[mockTrack.id]!.positionSeconds).toBe(90);
    expect(syncProgressToBackend).toHaveBeenCalledWith({
      listingId: mockTrack.id,
      positionSeconds: 90,
      durationSeconds: 1800,
    });
  });

  it("should mark listing completed on track end and stop if no next track", async () => {
    await service.playListing(mockTrack);
    await engineEvents.onTrackEnd!();

    expect(useProgressStore.getState().progressMap[mockTrack.id]?.completedAt).toBeDefined();
    expect(usePlaybackStore.getState().currentTrack).toBeNull();
    expect(usePlaybackStore.getState().status).toBe("idle");
  });

  it("should load engine with existing url when track.url is non-empty and not a local file", async () => {
    await service.playListing(mockTrack);
    // httpClient should NOT have been called since url is already present
    expect(httpClient).not.toHaveBeenCalled();
    expect(mockEngine.load).toHaveBeenCalledWith(mockTrack);
  });

  it("should lazily resolve stream URL when track.url is empty", async () => {
    const stubTrack: Track = { ...mockTrack, url: "" };
    (httpClient as any).mockResolvedValue({ url: "https://fresh-signed.mp3" });

    await service.playListing(stubTrack);

    expect(httpClient).toHaveBeenCalledWith({
      url: "/audio/listings/l1/stream",
      method: "GET",
    });
    expect(mockEngine.load).toHaveBeenCalledWith({ ...stubTrack, url: "https://fresh-signed.mp3" });
    expect(mockEngine.play).toHaveBeenCalled();
  });

  it("should pass local file:// URI through to engine without resolving", async () => {
    const localTrack: Track = { ...mockTrack, url: "file:///sdcard/lecture.mp3" };

    await service.playListing(localTrack);

    expect(httpClient).not.toHaveBeenCalled();
    expect(mockEngine.load).toHaveBeenCalledWith(localTrack);
  });
});
