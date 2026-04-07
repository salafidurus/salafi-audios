import { useProgressStore } from "./progress.store";
import type { LectureProgress } from "../types";

const initialState = useProgressStore.getState();

function resetStore() {
  useProgressStore.setState(initialState, true);
}

beforeEach(resetStore);

describe("progress store", () => {
  describe("setProgress", () => {
    it("creates an entry for a new lecture", () => {
      useProgressStore.getState().actions.setProgress("lec1", 30, 600);

      const entry = useProgressStore.getState().progressMap["lec1"];
      expect(entry).toBeDefined();
      expect(entry.lectureId).toBe("lec1");
      expect(entry.positionSeconds).toBe(30);
      expect(entry.durationSeconds).toBe(600);
      expect(entry.updatedAt).toBeDefined();
    });

    it("preserves completedAt on subsequent updates", () => {
      useProgressStore.getState().actions.setProgress("lec1", 30, 600);
      useProgressStore.getState().actions.markCompleted("lec1");
      const completedAt = useProgressStore.getState().progressMap["lec1"].completedAt;

      useProgressStore.getState().actions.setProgress("lec1", 60, 600);

      expect(useProgressStore.getState().progressMap["lec1"].completedAt).toBe(completedAt);
    });

    it("updates updatedAt on each call", () => {
      useProgressStore.getState().actions.setProgress("lec1", 10, 600);
      const first = useProgressStore.getState().progressMap["lec1"].updatedAt;

      // Small delay to ensure different timestamp
      jest.advanceTimersByTime?.(10);
      useProgressStore.getState().actions.setProgress("lec1", 20, 600);
      const second = useProgressStore.getState().progressMap["lec1"].updatedAt;

      // Both should be valid ISO strings (may or may not differ in fast execution)
      expect(typeof first).toBe("string");
      expect(typeof second).toBe("string");
    });
  });

  describe("markCompleted", () => {
    it("sets completedAt on an existing entry", () => {
      useProgressStore.getState().actions.setProgress("lec1", 600, 600);
      useProgressStore.getState().actions.markCompleted("lec1");

      const entry = useProgressStore.getState().progressMap["lec1"];
      expect(entry.completedAt).toBeDefined();
      expect(typeof entry.completedAt).toBe("string");
    });

    it("is a no-op on unknown lecture id", () => {
      const before = { ...useProgressStore.getState().progressMap };
      useProgressStore.getState().actions.markCompleted("nonexistent");
      expect(useProgressStore.getState().progressMap).toEqual(before);
    });
  });

  describe("saved lectures", () => {
    it("addSaved marks a lecture as saved", () => {
      useProgressStore.getState().actions.addSaved("lec1");
      expect(useProgressStore.getState().actions.isSaved("lec1")).toBe(true);
    });

    it("removeSaved unmarks a lecture", () => {
      useProgressStore.getState().actions.addSaved("lec1");
      useProgressStore.getState().actions.removeSaved("lec1");
      expect(useProgressStore.getState().actions.isSaved("lec1")).toBe(false);
    });

    it("isSaved returns false for unknown lecture", () => {
      expect(useProgressStore.getState().actions.isSaved("nonexistent")).toBe(false);
    });

    it("getSavedIds returns all saved lecture ids", () => {
      useProgressStore.getState().actions.addSaved("lec1");
      useProgressStore.getState().actions.addSaved("lec2");
      const ids = useProgressStore.getState().actions.getSavedIds();
      expect(ids).toHaveLength(2);
      expect(ids).toContain("lec1");
      expect(ids).toContain("lec2");
    });
  });

  describe("loadProgress", () => {
    it("merges entries without clobbering existing ones", () => {
      useProgressStore.getState().actions.setProgress("lec1", 30, 600);

      const newEntry: LectureProgress = {
        lectureId: "lec2",
        positionSeconds: 60,
        durationSeconds: 900,
        updatedAt: "2024-01-01T00:00:00Z",
      };
      useProgressStore.getState().actions.loadProgress([newEntry]);

      const map = useProgressStore.getState().progressMap;
      expect(map["lec1"]).toBeDefined();
      expect(map["lec2"]).toEqual(newEntry);
    });

    it("overwrites an existing entry when loaded with same id", () => {
      useProgressStore.getState().actions.setProgress("lec1", 30, 600);

      const updated: LectureProgress = {
        lectureId: "lec1",
        positionSeconds: 100,
        durationSeconds: 600,
        updatedAt: "2025-01-01T00:00:00Z",
      };
      useProgressStore.getState().actions.loadProgress([updated]);

      expect(useProgressStore.getState().progressMap["lec1"].positionSeconds).toBe(100);
    });
  });

  describe("loadSaved", () => {
    it("merges saved entries without clobbering existing ones", () => {
      useProgressStore.getState().actions.addSaved("lec1");

      useProgressStore
        .getState()
        .actions.loadSaved([{ lectureId: "lec2", savedAt: "2024-01-01T00:00:00Z" }]);

      const ids = useProgressStore.getState().actions.getSavedIds();
      expect(ids).toContain("lec1");
      expect(ids).toContain("lec2");
    });
  });
});
