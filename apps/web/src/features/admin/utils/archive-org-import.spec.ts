import { describe, it, expect, beforeEach, afterEach, vi } from "bun:test";
import { parseArchiveOrgIdentifier, resolveArchiveOrgFiles } from "./archive-org-import";

describe("parseArchiveOrgIdentifier", () => {
  it("extracts the identifier from a /details/ link", () => {
    expect(parseArchiveOrgIdentifier("https://archive.org/details/ArafatTranslation")).toBe(
      "ArafatTranslation",
    );
  });

  it("extracts the identifier from a /download/ link (with or without a filename)", () => {
    expect(parseArchiveOrgIdentifier("https://archive.org/download/ArafatTranslation")).toBe(
      "ArafatTranslation",
    );
    expect(
      parseArchiveOrgIdentifier(
        "https://archive.org/download/ArafatTranslation/Bengali%20Hajj%20Khutbah.mp3",
      ),
    ).toBe("ArafatTranslation");
  });

  it("extracts the identifier from a /compress/ bundler link", () => {
    expect(
      parseArchiveOrgIdentifier(
        "https://archive.org/compress/ArafatTranslation/formats=VBR%20MP3&file=/ArafatTranslation.zip",
      ),
    ).toBe("ArafatTranslation");
  });

  it("accepts a bare identifier with no slashes", () => {
    expect(parseArchiveOrgIdentifier("ArafatTranslation")).toBe("ArafatTranslation");
  });

  it("returns null for a URL that isn't an archive.org reference", () => {
    expect(parseArchiveOrgIdentifier("https://miraath.net/some-file.wav")).toBeNull();
  });

  it("rejects a different domain that merely ends with the string 'archive.org'", () => {
    expect(parseArchiveOrgIdentifier("https://evilarchive.org/details/malicious")).toBeNull();
    expect(parseArchiveOrgIdentifier("https://my-archive.org.evil.com/details/x")).toBeNull();
    expect(parseArchiveOrgIdentifier("https://notarchive.org/details/x")).toBeNull();
  });

  it("accepts a genuine archive.org subdomain", () => {
    expect(
      parseArchiveOrgIdentifier("https://ia601909.us.archive.org/details/ArafatTranslation"),
    ).toBe("ArafatTranslation");
  });

  it("returns null for an unrelated plain string containing spaces", () => {
    expect(parseArchiveOrgIdentifier("not an identifier at all")).toBeNull();
  });
});

describe("resolveArchiveOrgFiles", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("queries the metadata API and returns direct download URLs for audio files only", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          files: [
            { name: "ArafatTranslation_meta.xml", format: "Metadata" },
            { name: "Bengali Hajj Khutbah.mp3", format: "VBR MP3" },
            { name: "Bengali Hajj Khutbah.png", format: "PNG" },
            { name: "Urdu Khutbah.ogg", format: "Ogg Vorbis" },
          ],
        }),
    });

    const files = await resolveArchiveOrgFiles("ArafatTranslation");

    expect(global.fetch).toHaveBeenCalledWith("https://archive.org/metadata/ArafatTranslation");
    expect(files).toEqual([
      {
        url: "https://archive.org/download/ArafatTranslation/Bengali%20Hajj%20Khutbah.mp3",
        filename: "Bengali Hajj Khutbah.mp3",
      },
      {
        url: "https://archive.org/download/ArafatTranslation/Urdu%20Khutbah.ogg",
        filename: "Urdu Khutbah.ogg",
      },
    ]);
  });

  it("throws a clear error when the item metadata can't be fetched", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(resolveArchiveOrgFiles("does-not-exist")).rejects.toThrow(/archive\.org item/i);
  });
});
