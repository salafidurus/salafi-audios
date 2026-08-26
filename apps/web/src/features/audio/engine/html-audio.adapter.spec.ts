import type { Track } from "@sd/domain-audio";

import { describe, it, expect, beforeEach, vi } from "bun:test";

import { HTMLAudioAdapter } from "./html-audio.adapter";

const mockTrack: Track = {
  id: "l1",
  slug: "l1-slug",
  title: "Lecture 1",
  artist: "Scholar 1",
  artworkUrl: "https://cdn.test/art.jpg",
  url: "https://stream.test/l1.mp3",
  durationSeconds: 1800,
};

let mediaSessionMock: {
  metadata: unknown;
  playbackState: string;
  setActionHandler: ReturnType<typeof vi.fn>;
};

function getHandler(action: string) {
  const call = mediaSessionMock.setActionHandler.mock.calls.find(
    (call: unknown[]) => call[0] === action,
  );
  return call?.[1] as ((details: { seekTime?: number }) => void) | undefined;
}

beforeEach(() => {
  mediaSessionMock = {
    metadata: null,
    playbackState: "none",
    setActionHandler: vi.fn(),
  };
  Object.defineProperty(navigator, "mediaSession", {
    value: mediaSessionMock,
    configurable: true,
  });

  (globalThis as any).MediaMetadata = class MediaMetadata {
    title: string;
    artist: string;
    artwork: unknown[];
    constructor(init: { title: string; artist: string; artwork: unknown[] }) {
      this.title = init.title;
      this.artist = init.artist;
      this.artwork = init.artwork;
    }
  };
});

describe("HTMLAudioAdapter — MediaSession", () => {
  it("sets mediaSession metadata (title/artist/artwork) on load", async () => {
    const adapter = new HTMLAudioAdapter();
    await adapter.load(mockTrack);

    const metadata = mediaSessionMock.metadata as {
      title: string;
      artist: string;
      artwork: unknown[];
    };
    expect(metadata.title).toBe("Lecture 1");
    expect(metadata.artist).toBe("Scholar 1");
    expect(metadata.artwork).toEqual([{ src: "https://cdn.test/art.jpg" }]);
  });

  it("registers play/pause/previoustrack/nexttrack/seekto action handlers", async () => {
    const adapter = new HTMLAudioAdapter();
    await adapter.load(mockTrack);

    const registered = mediaSessionMock.setActionHandler.mock.calls.map(
      (call: unknown[]) => call[0],
    );
    expect(registered).toEqual(
      expect.arrayContaining(["play", "pause", "previoustrack", "nexttrack", "seekto"]),
    );
  });

  it("routes the previoustrack action to events.onSkipPrevious", async () => {
    const adapter = new HTMLAudioAdapter();
    const onSkipPrevious = vi.fn();
    adapter.setEvents({ onSkipPrevious });
    await adapter.load(mockTrack);

    getHandler("previoustrack")?.({});

    expect(onSkipPrevious).toHaveBeenCalled();
  });

  it("routes the nexttrack action to events.onSkipNext", async () => {
    const adapter = new HTMLAudioAdapter();
    const onSkipNext = vi.fn();
    adapter.setEvents({ onSkipNext });
    await adapter.load(mockTrack);

    getHandler("nexttrack")?.({});

    expect(onSkipNext).toHaveBeenCalled();
  });

  it("clears mediaSession metadata and playback state on stop", async () => {
    const adapter = new HTMLAudioAdapter();
    await adapter.load(mockTrack);
    expect(mediaSessionMock.metadata).not.toBeNull();

    await adapter.stop();

    expect(mediaSessionMock.metadata).toBeNull();
    expect(mediaSessionMock.playbackState).toBe("none");
  });
});
