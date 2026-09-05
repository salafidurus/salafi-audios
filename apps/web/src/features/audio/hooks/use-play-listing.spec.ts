import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "bun:test";

import { audioService } from "../audio-service";
import { usePlayListing } from "./use-play-listing";

const mockHttpClient = vi.fn();

vi.mock("@sd/core-contracts", () => ({
  httpClient: mockHttpClient,
  endpoints: {
    listings: {
      contents: (id: string) => `/v1/listings/${id}/contents`,
    },
  },
}));

vi.mock("../audio-service", () => ({
  audioService: {
    playListing: vi.fn(),
  },
}));

const singleRef = {
  id: "lec-1",
  slug: "importance-of-sunnah",
  title: "Importance of Sunnah",
  format: "single" as const,
  scholarName: "Ibn Uthaymeen",
  scholarSlug: "ibn-uthaymeen",
};

const seriesRef = {
  id: "series-1",
  slug: "explanation-of-tawheed",
  title: "Explanation of Tawheed",
  format: "series" as const,
  scholarName: "Ibn Baz",
  scholarSlug: "ibn-baz",
};

describe("usePlayListing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches the listing's contents by slug and plays the single lecture", async () => {
    mockHttpClient.mockResolvedValue({
      format: "single",
      items: [
        {
          id: "lec-1",
          slug: "importance-of-sunnah",
          title: "Importance of Sunnah",
          durationSeconds: 1800,
          primaryAudioAsset: { id: "a1", url: "https://s/lec-1.mp3" },
        },
      ],
    });

    const { result } = renderHook(() => usePlayListing(singleRef));
    await act(async () => {
      await result.current.play();
    });

    expect(audioService.playListing).toHaveBeenCalledTimes(1);
    const [track, queue] = (audioService.playListing as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(track).toMatchObject({ id: "lec-1", url: "https://s/lec-1.mp3" });
    expect(queue).toHaveLength(1);
  });

  it("fetches the listing's contents and plays the full ordered queue for a series", async () => {
    mockHttpClient.mockResolvedValue({
      format: "series",
      items: [
        {
          id: "lesson-1",
          slug: "lesson-1",
          title: "Lesson 1",
          orderIndex: 0,
          primaryAudioAsset: { id: "a1", url: "https://s/lesson-1.mp3" },
        },
        {
          id: "lesson-2",
          slug: "lesson-2",
          title: "Lesson 2",
          orderIndex: 1,
          primaryAudioAsset: { id: "a2", url: "https://s/lesson-2.mp3" },
        },
      ],
    });

    const { result } = renderHook(() => usePlayListing(seriesRef));
    await act(async () => {
      await result.current.play();
    });

    expect(audioService.playListing).toHaveBeenCalledTimes(1);
    const [track, queue] = (audioService.playListing as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(track).toMatchObject({ id: "lesson-1", url: "https://s/lesson-1.mp3" });
    expect(queue.map((t: { id: string }) => t.id)).toEqual(["lesson-1", "lesson-2"]);
  });

  it("surfaces an error and does not call playListing when the listing has no playable content", async () => {
    mockHttpClient.mockResolvedValue({ format: "series", items: [] });
    const onError = vi.fn();

    const { result } = renderHook(() => usePlayListing(seriesRef, { onError }));
    await act(async () => {
      await result.current.play();
    });

    expect(audioService.playListing).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith("No audio available for this lecture.");
  });

  it("surfaces a sanitized error and does not call playListing when the fetch fails", async () => {
    mockHttpClient.mockRejectedValue(new Error("network down"));
    const onError = vi.fn();

    const { result } = renderHook(() => usePlayListing(singleRef, { onError }));
    await act(async () => {
      await result.current.play();
    });

    expect(audioService.playListing).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.any(String));
  });

  it("does nothing when ref is null", async () => {
    const { result } = renderHook(() => usePlayListing(null));
    await act(async () => {
      await result.current.play();
    });

    expect(mockHttpClient).not.toHaveBeenCalled();
    expect(audioService.playListing).not.toHaveBeenCalled();
  });
});
