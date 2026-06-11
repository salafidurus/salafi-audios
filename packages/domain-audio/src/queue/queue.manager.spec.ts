import { QueueManager } from "./queue.manager";
import type { Track } from "../types/track.types";

describe("QueueManager", () => {
  let manager: QueueManager;

  const mockTracks: Track[] = [
    {
      id: "t1",
      title: "Track 1",
      artist: "Scholar 1",
      url: "https://test.mp3",
      durationSeconds: 600,
    },
    {
      id: "t2",
      title: "Track 2",
      artist: "Scholar 1",
      url: "https://test.mp3",
      durationSeconds: 1200,
    },
    {
      id: "t3",
      title: "Track 3",
      artist: "Scholar 2",
      url: "https://test.mp3",
      durationSeconds: 1800,
    },
  ];

  beforeEach(() => {
    manager = new QueueManager();
  });

  it("should initialize with empty queue", () => {
    expect(manager.getQueue()).toEqual([]);
    expect(manager.getCurrentTrack()).toBeNull();
  });

  it("should load tracks and start index", () => {
    manager.setQueue(mockTracks, 1);
    expect(manager.getQueue()).toEqual(mockTracks);
    expect(manager.getCurrentTrack()).toEqual(mockTracks[1]);
  });

  it("should track hasNext status correctly", () => {
    manager.setQueue(mockTracks, 0);
    expect(manager.hasNext()).toBe(true);

    manager.setQueue(mockTracks, 2);
    expect(manager.hasNext()).toBe(false);
  });

  it("should advance to the next track correctly", () => {
    manager.setQueue(mockTracks, 0);
    expect(manager.getCurrentTrack()).toEqual(mockTracks[0]);

    const nextTrack = manager.advance();
    expect(nextTrack).toEqual(mockTracks[1]);
    expect(manager.getCurrentTrack()).toEqual(mockTracks[1]);
  });

  it("should clear queue state successfully", () => {
    manager.setQueue(mockTracks, 0);
    manager.clear();
    expect(manager.getQueue()).toEqual([]);
    expect(manager.getCurrentTrack()).toBeNull();
  });
});
