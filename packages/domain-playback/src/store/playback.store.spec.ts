import { usePlaybackStore } from "./playback.store";
import type { Track } from "../types";

const initialState = usePlaybackStore.getState();

function resetStore() {
  usePlaybackStore.setState(initialState, true);
}

function makeTrack(overrides: Partial<Track> = {}): Track {
  return {
    id: "t1",
    lectureId: "l1",
    title: "Test Lecture",
    audioUrl: "https://example.com/audio.mp3",
    durationSeconds: 300,
    ...overrides,
  };
}

beforeEach(resetStore);

describe("playback store", () => {
  describe("play", () => {
    it("sets currentTrack to the given track", () => {
      const track = makeTrack();
      usePlaybackStore.getState().actions.play(track);
      expect(usePlaybackStore.getState().currentTrack).toEqual(track);
    });

    it("sets status to loading", () => {
      usePlaybackStore.getState().actions.play(makeTrack());
      expect(usePlaybackStore.getState().status).toBe("loading");
    });

    it("resets positionSeconds to 0", () => {
      usePlaybackStore.setState({ positionSeconds: 42 });
      usePlaybackStore.getState().actions.play(makeTrack());
      expect(usePlaybackStore.getState().positionSeconds).toBe(0);
    });

    it("sets durationSeconds from the track", () => {
      usePlaybackStore.getState().actions.play(makeTrack({ durationSeconds: 600 }));
      expect(usePlaybackStore.getState().durationSeconds).toBe(600);
    });

    it("defaults durationSeconds to 0 when track has none", () => {
      usePlaybackStore.getState().actions.play(makeTrack({ durationSeconds: undefined }));
      expect(usePlaybackStore.getState().durationSeconds).toBe(0);
    });

    it("clears any previous error", () => {
      usePlaybackStore.setState({ error: "old error" });
      usePlaybackStore.getState().actions.play(makeTrack());
      expect(usePlaybackStore.getState().error).toBeUndefined();
    });
  });

  describe("pause / resume", () => {
    it("pause sets status to paused without clearing track", () => {
      const track = makeTrack();
      usePlaybackStore.getState().actions.play(track);
      usePlaybackStore.getState().actions.pause();

      expect(usePlaybackStore.getState().status).toBe("paused");
      expect(usePlaybackStore.getState().currentTrack).toEqual(track);
    });

    it("resume sets status to playing without clearing track", () => {
      const track = makeTrack();
      usePlaybackStore.getState().actions.play(track);
      usePlaybackStore.getState().actions.pause();
      usePlaybackStore.getState().actions.resume();

      expect(usePlaybackStore.getState().status).toBe("playing");
      expect(usePlaybackStore.getState().currentTrack).toEqual(track);
    });
  });

  describe("seek", () => {
    it("updates positionSeconds", () => {
      usePlaybackStore.getState().actions.seek(99);
      expect(usePlaybackStore.getState().positionSeconds).toBe(99);
    });
  });

  describe("stop", () => {
    it("clears currentTrack and resets to idle", () => {
      usePlaybackStore.getState().actions.play(makeTrack());
      usePlaybackStore.getState().actions.stop();

      const state = usePlaybackStore.getState();
      expect(state.currentTrack).toBeNull();
      expect(state.status).toBe("idle");
      expect(state.positionSeconds).toBe(0);
      expect(state.durationSeconds).toBe(0);
    });
  });

  describe("setError", () => {
    it("sets status to error and stores the message", () => {
      usePlaybackStore.getState().actions.setError("network failure");

      const state = usePlaybackStore.getState();
      expect(state.status).toBe("error");
      expect(state.error).toBe("network failure");
    });
  });

  describe("queue operations", () => {
    it("enqueue adds an item to the queue", () => {
      const track = makeTrack({ id: "q1" });
      usePlaybackStore.getState().actions.enqueue(track);

      const queue = usePlaybackStore.getState().queue;
      expect(queue).toHaveLength(1);
      expect(queue[0].track).toEqual(track);
      expect(typeof queue[0].addedAt).toBe("number");
    });

    it("enqueue appends to existing queue", () => {
      usePlaybackStore.getState().actions.enqueue(makeTrack({ id: "q1" }));
      usePlaybackStore.getState().actions.enqueue(makeTrack({ id: "q2" }));
      expect(usePlaybackStore.getState().queue).toHaveLength(2);
    });

    it("dequeue removes matching track by id", () => {
      usePlaybackStore.getState().actions.enqueue(makeTrack({ id: "q1" }));
      usePlaybackStore.getState().actions.enqueue(makeTrack({ id: "q2" }));
      usePlaybackStore.getState().actions.dequeue("q1");

      const queue = usePlaybackStore.getState().queue;
      expect(queue).toHaveLength(1);
      expect(queue[0].track.id).toBe("q2");
    });

    it("clearQueue empties the queue", () => {
      usePlaybackStore.getState().actions.enqueue(makeTrack({ id: "q1" }));
      usePlaybackStore.getState().actions.enqueue(makeTrack({ id: "q2" }));
      usePlaybackStore.getState().actions.clearQueue();
      expect(usePlaybackStore.getState().queue).toEqual([]);
    });
  });

  describe("skipToNext", () => {
    it("stops when queue is empty", () => {
      usePlaybackStore.getState().actions.play(makeTrack());
      usePlaybackStore.getState().actions.skipToNext();

      const state = usePlaybackStore.getState();
      expect(state.currentTrack).toBeNull();
      expect(state.status).toBe("idle");
    });

    it("plays the next item when queue has one track", () => {
      const next = makeTrack({ id: "next1", title: "Next Track" });
      usePlaybackStore.getState().actions.play(makeTrack());
      usePlaybackStore.getState().actions.enqueue(next);
      usePlaybackStore.getState().actions.skipToNext();

      const state = usePlaybackStore.getState();
      expect(state.currentTrack).toEqual(next);
      expect(state.status).toBe("loading");
      expect(state.queue).toHaveLength(0);
    });

    it("plays first queued item (FIFO) and keeps the rest", () => {
      const first = makeTrack({ id: "first" });
      const second = makeTrack({ id: "second" });
      usePlaybackStore.getState().actions.play(makeTrack());
      usePlaybackStore.getState().actions.enqueue(first);
      usePlaybackStore.getState().actions.enqueue(second);
      usePlaybackStore.getState().actions.skipToNext();

      const state = usePlaybackStore.getState();
      expect(state.currentTrack).toEqual(first);
      expect(state.queue).toHaveLength(1);
      expect(state.queue[0].track.id).toBe("second");
    });
  });
});
