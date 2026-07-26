import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import type { AdminArrangeDataDto } from "@sd/core-contracts";
import {
  getBatchPresignedUrls,
  uploadToR2WithProgress,
  commitArrange,
} from "@/features/admin/api/admin-lectures.api";
import { fetchFileFromUrl } from "@/features/admin/utils/fetch-remote-file";
import { useUploadArrangeState } from "./useUploadArrangeState";
import { useUploadArrangeCommit } from "./useUploadArrangeCommit";

vi.mock("@/features/admin/api/admin-lectures.api", () => ({
  getBatchPresignedUrls: vi.fn(),
  uploadToR2WithProgress: vi.fn(),
  commitArrange: vi.fn(),
  updateListingMedia: vi.fn(),
  ArrangeConflictError: class ArrangeConflictError extends Error {
    conflictingSlugs: string[] = [];
  },
}));

vi.mock("@/features/admin/utils/fetch-remote-file", () => ({
  fetchFileFromUrl: vi.fn(),
}));

const seriesData: AdminArrangeDataDto = {
  id: "series-1",
  slug: "ajurumiyyah",
  title: "Ajurumiyyah",
  format: "series",
  scholarId: "scholar-1",
  status: "published",
  modules: [],
  lessons: [],
};

function setupWithItem(entry: { url: string; filename: string; sizeBytes: number }) {
  const hook = renderHook(() => {
    const { state, dispatch } = useUploadArrangeState();
    const commit = useUploadArrangeCommit(state, dispatch, vi.fn());
    return { state, dispatch, commit };
  });
  act(() => hook.result.current.dispatch({ type: "INIT_EXISTING", data: seriesData }));
  act(() =>
    hook.result.current.dispatch({
      type: "ADD_URL_ITEMS",
      items: [{ ...entry, contentType: "audio/mpeg", durationSeconds: 90 }],
    }),
  );
  return hook;
}

describe("useUploadArrangeCommit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getBatchPresignedUrls as Mock<any>).mockResolvedValue({
      files: [
        { clientId: "placeholder", uploadUrl: "https://r2/upload", objectKey: "audio/key.mp3" },
      ],
    });
    (commitArrange as Mock<any>).mockResolvedValue({});
  });

  it("downloads a url-sourced item's bytes (reporting progress) before uploading it", async () => {
    const hook = setupWithItem({
      url: "https://archive.org/download/Item/Lesson.mp3",
      filename: "Lesson.mp3",
      sizeBytes: 1000,
    });
    const itemId = hook.result.current.state.items[0]!.id;
    (getBatchPresignedUrls as Mock<any>).mockResolvedValue({
      files: [{ clientId: itemId, uploadUrl: "https://r2/upload", objectKey: "audio/key.mp3" }],
    });

    const downloadedFile = new File(["bytes"], "Lesson.mp3", { type: "audio/mpeg" });
    (fetchFileFromUrl as Mock<any>).mockImplementation(
      async (_url: string, onProgress?: (loaded: number, total: number | null) => void) => {
        onProgress?.(500, 1000);
        onProgress?.(1000, 1000);
        return downloadedFile;
      },
    );
    (uploadToR2WithProgress as Mock<any>).mockImplementation(
      async (_url: string, _file: File, _type: string, onProgress: (percent: number) => void) => {
        onProgress(100);
      },
    );

    await act(async () => {
      await hook.result.current.commit();
    });

    expect(fetchFileFromUrl).toHaveBeenCalledWith(
      "https://archive.org/download/Item/Lesson.mp3",
      expect.any(Function),
    );
    expect(uploadToR2WithProgress).toHaveBeenCalledWith(
      "https://r2/upload",
      downloadedFile,
      "audio/mpeg",
      expect.any(Function),
    );

    const item = hook.result.current.state.items[0]!;
    expect(item.upload.status).toBe("done");
  });

  it("does not call fetchFileFromUrl for a locally-picked file", async () => {
    const hook = renderHook(() => {
      const { state, dispatch } = useUploadArrangeState();
      const commit = useUploadArrangeCommit(state, dispatch, vi.fn());
      return { state, dispatch, commit };
    });
    act(() => hook.result.current.dispatch({ type: "INIT_EXISTING", data: seriesData }));
    act(() =>
      hook.result.current.dispatch({
        type: "ADD_FILES",
        files: [
          { file: new File(["a"], "Lesson.mp3", { type: "audio/mpeg" }), durationSeconds: 90 },
        ],
      }),
    );
    const itemId = hook.result.current.state.items[0]!.id;
    (getBatchPresignedUrls as Mock<any>).mockResolvedValue({
      files: [{ clientId: itemId, uploadUrl: "https://r2/upload", objectKey: "audio/key.mp3" }],
    });
    (uploadToR2WithProgress as Mock<any>).mockResolvedValue(undefined);

    await act(async () => {
      await hook.result.current.commit();
    });

    expect(fetchFileFromUrl).not.toHaveBeenCalled();
    expect(uploadToR2WithProgress).toHaveBeenCalled();
  });

  it("reports a clear error and skips upload when the download fails", async () => {
    const hook = setupWithItem({
      url: "https://miraath.net/file.wav",
      filename: "file.wav",
      sizeBytes: 1000,
    });
    const itemId = hook.result.current.state.items[0]!.id;
    (getBatchPresignedUrls as Mock<any>).mockResolvedValue({
      files: [{ clientId: itemId, uploadUrl: "https://r2/upload", objectKey: "audio/key.wav" }],
    });
    (fetchFileFromUrl as Mock<any>).mockRejectedValue(
      new Error("source doesn't allow cross-origin downloads"),
    );

    await act(async () => {
      await hook.result.current.commit();
    });

    expect(uploadToR2WithProgress).not.toHaveBeenCalled();
    const item = hook.result.current.state.items[0]!;
    expect(item.upload.status).toBe("error");
    expect(item.upload.error).toMatch(/cross-origin/i);
  });
});
