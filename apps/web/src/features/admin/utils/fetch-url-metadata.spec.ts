import { describe, it, expect, beforeEach, afterEach, vi } from "bun:test";

import { fetchUrlMetadata } from "./fetch-url-metadata";

function mockResponse(options: {
  ok?: boolean;
  status?: number;
  headers?: Record<string, string>;
}) {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    headers: new Headers(options.headers ?? {}),
  } as Response;
}

describe("fetchUrlMetadata", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("reads filename, content type, and size from a successful HEAD response", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse({
        headers: {
          "content-type": "audio/mpeg",
          "content-length": "907485",
          "content-disposition": 'attachment; filename="Lesson.mp3"',
        },
      }),
    );

    const meta = await fetchUrlMetadata("https://example.com/files/abc");

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/files/abc", {
      method: "HEAD",
    });
    expect(meta).toEqual({
      filename: "Lesson.mp3",
      contentType: "audio/mpeg",
      sizeBytes: 907485,
    });
  });

  it("falls back to a ranged GET and reads size from Content-Range when HEAD is rejected", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockResponse({ ok: false, status: 405 }))
      .mockResolvedValueOnce(
        mockResponse({
          ok: true,
          status: 206,
          headers: {
            "content-type": "audio/wav",
            "content-range": "bytes 0-0/31062168",
          },
        }),
      );

    const meta = await fetchUrlMetadata("https://example.com/files/lesson.wav");

    expect(global.fetch).toHaveBeenLastCalledWith("https://example.com/files/lesson.wav", {
      headers: { Range: "bytes=0-0" },
    });
    expect(meta.sizeBytes).toBe(31062168);
    expect(meta.filename).toBe("lesson.wav");
  });

  it("rejects an HTML response with a clear 'not a direct file' error", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse({ headers: { "content-type": "text/html; charset=UTF-8" } }),
    );

    await expect(fetchUrlMetadata("https://example.com/post-page/")).rejects.toThrow(/web page/i);
  });

  it("maps a network/CORS-style failure to a friendly, actionable message", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new TypeError("Failed to fetch"),
    );

    await expect(fetchUrlMetadata("https://blocked.example.com/file.wav")).rejects.toThrow(
      /cross-origin|CORS|blocking/i,
    );
  });

  it("returns a null size when neither Content-Length nor Content-Range is present", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse({ headers: { "content-type": "audio/mpeg" } }),
    );

    const meta = await fetchUrlMetadata("https://example.com/files/lesson.mp3");

    expect(meta.sizeBytes).toBeNull();
  });
});
