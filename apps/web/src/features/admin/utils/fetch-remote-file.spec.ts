import { describe, it, expect, beforeEach, afterEach, vi } from "bun:test";
import { fetchFileFromUrl } from "./fetch-remote-file";

function mockResponse(options: {
  ok?: boolean;
  status?: number;
  headers?: Record<string, string>;
  body?: string;
}) {
  const headers = new Headers(options.headers ?? {});
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    headers,
    blob: () => Promise.resolve(new Blob([options.body ?? "audio-bytes"])),
  } as Response;
}

describe("fetchFileFromUrl", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("builds a File using the Content-Disposition filename and content type", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse({
        headers: {
          "content-type": "audio/mpeg",
          "content-disposition": 'attachment; filename="Lesson One.mp3"',
        },
      }),
    );

    const file = await fetchFileFromUrl("https://example.com/files/abc123");

    expect(file.name).toBe("Lesson One.mp3");
    expect(file.type).toBe("audio/mpeg");
  });

  it("derives the filename from the URL path when Content-Disposition is absent", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse({ headers: { "content-type": "audio/wav" } }),
    );

    const file = await fetchFileFromUrl("https://example.com/audio/Lesson%20Two.wav");

    expect(file.name).toBe("Lesson Two.wav");
    expect(file.type).toBe("audio/wav");
  });

  it("guesses a content type from the extension when the header is missing or generic", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse({ headers: { "content-type": "application/octet-stream" } }),
    );

    const file = await fetchFileFromUrl("https://example.com/audio/lesson.mp3");

    expect(file.type).toBe("audio/mpeg");
  });

  it("rejects an HTML response with a clear 'not a direct file' error", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse({ headers: { "content-type": "text/html; charset=UTF-8" } }),
    );

    await expect(fetchFileFromUrl("https://example.com/some-post-page/")).rejects.toThrow(
      /web page/i,
    );
  });

  it("rejects a non-OK HTTP response", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse({ ok: false, status: 404 }),
    );

    await expect(fetchFileFromUrl("https://example.com/missing.mp3")).rejects.toThrow(/404/);
  });

  it("maps a network/CORS-style failure to a friendly, actionable message", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new TypeError("Failed to fetch"),
    );

    await expect(fetchFileFromUrl("https://blocked.example.com/file.wav")).rejects.toThrow(
      /cross-origin|CORS|blocking/i,
    );
  });
});
