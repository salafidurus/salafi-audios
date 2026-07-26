import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { extractAudioDurationFromUrl } from "./audio-metadata";

describe("extractAudioDurationFromUrl", () => {
  let mockAudio: {
    src: string;
    duration: number;
    addEventListener: Mock<any>;
    removeEventListener: Mock<any>;
  };

  beforeEach(() => {
    mockAudio = {
      src: "",
      duration: 245,
      addEventListener: vi.fn((event: string, callback: () => void) => {
        if (event === "loadedmetadata") setTimeout(callback, 0);
      }),
      removeEventListener: vi.fn(),
    };
    global.Audio = vi.fn().mockImplementation(function () {
      return mockAudio;
    }) as unknown as typeof Audio;
  });

  it("points an Audio element directly at the remote URL (no object URL / blob download)", async () => {
    const duration = await extractAudioDurationFromUrl(
      "https://archive.org/download/Item/Lesson.mp3",
    );

    expect(mockAudio.src).toBe("https://archive.org/download/Item/Lesson.mp3");
    expect(duration).toBe(245);
  });

  it("rejects when the audio element fires an error event", async () => {
    global.Audio = vi.fn().mockImplementation(function () {
      return {
        src: "",
        duration: 0,
        addEventListener: vi.fn((event: string, callback: () => void) => {
          if (event === "error") setTimeout(callback, 0);
        }),
        removeEventListener: vi.fn(),
      };
    }) as unknown as typeof Audio;

    await expect(extractAudioDurationFromUrl("https://example.com/broken.mp3")).rejects.toThrow(
      /failed to load/i,
    );
  });
});
