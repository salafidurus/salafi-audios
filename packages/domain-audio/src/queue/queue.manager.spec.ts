import { describe, it, expect, beforeEach } from "bun:test";

import type { Track } from "../types/track.types";

import { QueueManager } from "./queue.manager";

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

  it("should track hasPrevious status correctly", () => {
    manager.setQueue(mockTracks, 0);
    expect(manager.hasPrevious()).toBe(false);

    manager.setQueue(mockTracks, 1);
    expect(manager.hasPrevious()).toBe(true);
  });

  it("should go to the previous track correctly", () => {
    manager.setQueue(mockTracks, 2);
    const prevTrack = manager.previous();
    expect(prevTrack).toEqual(mockTracks[1]);
    expect(manager.getCurrentTrack()).toEqual(mockTracks[1]);
  });

  it("should return null from previous() when there is no previous track", () => {
    manager.setQueue(mockTracks, 0);
    expect(manager.previous()).toBeNull();
    expect(manager.getCurrentTrack()).toEqual(mockTracks[0]);
  });

  it("should report the current index", () => {
    manager.setQueue(mockTracks, 1);
    expect(manager.getCurrentIndex()).toBe(1);
  });

  it("should report -1 as the current index when empty", () => {
    expect(manager.getCurrentIndex()).toBe(-1);
  });

  it("should jump to an arbitrary valid index", () => {
    manager.setQueue(mockTracks, 0);
    const track = manager.jumpTo(2);
    expect(track).toEqual(mockTracks[2]);
    expect(manager.getCurrentIndex()).toBe(2);
  });

  it("should not change position when jumping to an out-of-range index", () => {
    manager.setQueue(mockTracks, 0);
    expect(manager.jumpTo(99)).toBeNull();
    expect(manager.jumpTo(-1)).toBeNull();
    expect(manager.getCurrentIndex()).toBe(0);
  });

  it("should peek the next track without advancing", () => {
    manager.setQueue(mockTracks, 0);
    expect(manager.getNextTrack()).toEqual(mockTracks[1]);
    expect(manager.getCurrentIndex()).toBe(0);
  });

  it("should return null when peeking next at the end of the queue", () => {
    manager.setQueue(mockTracks, 2);
    expect(manager.getNextTrack()).toBeNull();
  });

  it("should peek the previous track without moving", () => {
    manager.setQueue(mockTracks, 2);
    expect(manager.getPreviousTrack()).toEqual(mockTracks[1]);
    expect(manager.getCurrentIndex()).toBe(2);
  });

  it("should return null when peeking previous at the start of the queue", () => {
    manager.setQueue(mockTracks, 0);
    expect(manager.getPreviousTrack()).toBeNull();
  });
});
