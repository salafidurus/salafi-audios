import { useDownloadsStore } from "./downloads.store";

const initialState = useDownloadsStore.getState();

function resetStore() {
  useDownloadsStore.setState(initialState, true);
}

beforeEach(resetStore);

describe("downloads store", () => {
  describe("startDownload", () => {
    it("creates a pending download entry", () => {
      useDownloadsStore.getState().actions.startDownload("lec1");

      const dl = useDownloadsStore.getState().downloads["lec1"]!;
      expect(dl).toBeDefined();
      expect(dl.lectureId).toBe("lec1");
      expect(dl.status).toBe("pending");
      expect(dl.progress).toBe(0);
      expect(typeof dl.startedAt).toBe("number");
    });
  });

  describe("setProgress", () => {
    it("updates progress and sets status to downloading", () => {
      useDownloadsStore.getState().actions.startDownload("lec1");
      useDownloadsStore.getState().actions.setProgress("lec1", 45);

      const dl = useDownloadsStore.getState().downloads["lec1"]!;
      expect(dl.status).toBe("downloading");
      expect(dl.progress).toBe(45);
    });

    it("is a no-op for unknown lectureId", () => {
      const before = { ...useDownloadsStore.getState().downloads };
      useDownloadsStore.getState().actions.setProgress("unknown", 50);
      expect(useDownloadsStore.getState().downloads).toEqual(before);
    });
  });

  describe("setComplete", () => {
    it("marks download as complete with localUri", () => {
      useDownloadsStore.getState().actions.startDownload("lec1");
      useDownloadsStore.getState().actions.setComplete("lec1", "/path/to/file.mp3");

      const dl = useDownloadsStore.getState().downloads["lec1"]!;
      expect(dl.status).toBe("complete");
      expect(dl.progress).toBe(100);
      expect(dl.localUri).toBe("/path/to/file.mp3");
      expect(typeof dl.completedAt).toBe("number");
    });

    it("is a no-op for unknown lectureId", () => {
      const before = { ...useDownloadsStore.getState().downloads };
      useDownloadsStore.getState().actions.setComplete("unknown", "/path");
      expect(useDownloadsStore.getState().downloads).toEqual(before);
    });
  });

  describe("setError", () => {
    it("sets error status and message", () => {
      useDownloadsStore.getState().actions.startDownload("lec1");
      useDownloadsStore.getState().actions.setError("lec1", "disk full");

      const dl = useDownloadsStore.getState().downloads["lec1"]!;
      expect(dl.status).toBe("error");
      expect(dl.error).toBe("disk full");
    });

    it("is a no-op for unknown lectureId", () => {
      const before = { ...useDownloadsStore.getState().downloads };
      useDownloadsStore.getState().actions.setError("unknown", "some error");
      expect(useDownloadsStore.getState().downloads).toEqual(before);
    });
  });

  describe("removeDownload", () => {
    it("removes a download entry", () => {
      useDownloadsStore.getState().actions.startDownload("lec1");
      useDownloadsStore.getState().actions.startDownload("lec2");
      useDownloadsStore.getState().actions.removeDownload("lec1");

      expect(useDownloadsStore.getState().downloads["lec1"]).toBeUndefined();
      expect(useDownloadsStore.getState().downloads["lec2"]).toBeDefined();
    });

    it("is a no-op for unknown lectureId", () => {
      useDownloadsStore.getState().actions.startDownload("lec1");
      useDownloadsStore.getState().actions.removeDownload("unknown");
      expect(useDownloadsStore.getState().downloads["lec1"]).toBeDefined();
    });
  });

  describe("getDownload", () => {
    it("returns the download entry for a known id", () => {
      useDownloadsStore.getState().actions.startDownload("lec1");
      const dl = useDownloadsStore.getState().actions.getDownload("lec1");
      expect(dl).toBeDefined();
      expect(dl!.lectureId).toBe("lec1");
    });

    it("returns undefined for unknown id", () => {
      expect(useDownloadsStore.getState().actions.getDownload("unknown")).toBeUndefined();
    });
  });
});
