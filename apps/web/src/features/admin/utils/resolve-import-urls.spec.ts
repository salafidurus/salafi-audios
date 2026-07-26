import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { importFilesFromLines } from "./resolve-import-urls";
import { fetchFileFromUrl } from "./fetch-remote-file";
import { parseArchiveOrgIdentifier, resolveArchiveOrgFiles } from "./archive-org-import";
import { parseGoogleDriveLink, buildGoogleDriveDownloadUrl } from "./google-drive-import";
import { isKnownUnsupportedSource } from "./unsupported-sources";

vi.mock("./fetch-remote-file", () => ({
  fetchFileFromUrl: vi.fn(),
}));
vi.mock("./archive-org-import", () => ({
  parseArchiveOrgIdentifier: vi.fn(),
  resolveArchiveOrgFiles: vi.fn(),
}));
vi.mock("./google-drive-import", () => ({
  parseGoogleDriveLink: vi.fn(),
  buildGoogleDriveDownloadUrl: vi.fn(),
}));
vi.mock("./unsupported-sources", () => ({
  isKnownUnsupportedSource: vi.fn(),
}));

function makeFile(name: string) {
  return new File(["bytes"], name, { type: "audio/mpeg" });
}

describe("importFilesFromLines", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (isKnownUnsupportedSource as Mock<any>).mockReturnValue(null);
    (parseArchiveOrgIdentifier as Mock<any>).mockReturnValue(null);
    (parseGoogleDriveLink as Mock<any>).mockReturnValue(null);
  });

  it("records a per-line error for known-unsupported sources without fetching", async () => {
    (isKnownUnsupportedSource as Mock<any>).mockImplementation((line: string) =>
      line.includes("onedrive") ? "OneDrive isn't supported" : null,
    );

    const result = await importFilesFromLines(["https://1drv.ms/u/c/onedrive-thing"]);

    expect(result.files).toEqual([]);
    expect(result.errors).toEqual([
      { input: "https://1drv.ms/u/c/onedrive-thing", message: "OneDrive isn't supported" },
    ]);
    expect(fetchFileFromUrl).not.toHaveBeenCalled();
  });

  it("records a per-line error for Google Drive folder links without fetching", async () => {
    (parseGoogleDriveLink as Mock<any>).mockReturnValue({ kind: "unsupported-folder" });

    const result = await importFilesFromLines(["https://drive.google.com/drive/folders/abc"]);

    expect(result.files).toEqual([]);
    expect(result.errors[0]?.message).toMatch(/folder/i);
    expect(fetchFileFromUrl).not.toHaveBeenCalled();
  });

  it("resolves a Google Drive file link to its direct download URL before fetching", async () => {
    (parseGoogleDriveLink as Mock<any>).mockReturnValue({ kind: "file", fileId: "abc123" });
    (buildGoogleDriveDownloadUrl as Mock<any>).mockReturnValue(
      "https://drive.usercontent.google.com/download?id=abc123&export=download&authuser=0",
    );
    (fetchFileFromUrl as Mock<any>).mockResolvedValue(makeFile("lecture.mp3"));

    const result = await importFilesFromLines([
      "https://drive.google.com/file/d/abc123/view?usp=sharing",
    ]);

    expect(fetchFileFromUrl).toHaveBeenCalledWith(
      "https://drive.usercontent.google.com/download?id=abc123&export=download&authuser=0",
    );
    expect(result.files.map((f) => f.name)).toEqual(["lecture.mp3"]);
    expect(result.errors).toEqual([]);
  });

  it("expands an archive.org identifier into multiple fetched files", async () => {
    (parseArchiveOrgIdentifier as Mock<any>).mockReturnValue("ArafatTranslation");
    (resolveArchiveOrgFiles as Mock<any>).mockResolvedValue([
      { url: "https://archive.org/download/ArafatTranslation/One.mp3", filename: "One.mp3" },
      { url: "https://archive.org/download/ArafatTranslation/Two.mp3", filename: "Two.mp3" },
    ]);
    (fetchFileFromUrl as Mock<any>).mockImplementation((url: string) =>
      Promise.resolve(makeFile(url.split("/").pop() ?? "file")),
    );

    const result = await importFilesFromLines(["https://archive.org/details/ArafatTranslation"]);

    expect(result.files.map((f) => f.name).sort()).toEqual(["One.mp3", "Two.mp3"]);
    expect(result.errors).toEqual([]);
  });

  it("treats an unrecognized line as a literal direct-file URL", async () => {
    (fetchFileFromUrl as Mock<any>).mockResolvedValue(makeFile("direct.wav"));

    const result = await importFilesFromLines(["https://example.com/direct.wav"]);

    expect(fetchFileFromUrl).toHaveBeenCalledWith("https://example.com/direct.wav");
    expect(result.files.map((f) => f.name)).toEqual(["direct.wav"]);
  });

  it("keeps successfully-fetched files when one entry in the batch fails", async () => {
    (fetchFileFromUrl as Mock<any>).mockImplementation((url: string) =>
      url.includes("bad")
        ? Promise.reject(new Error("Failed to fetch file: HTTP 404"))
        : Promise.resolve(makeFile("good.mp3")),
    );

    const result = await importFilesFromLines([
      "https://example.com/good.mp3",
      "https://example.com/bad.mp3",
    ]);

    expect(result.files.map((f) => f.name)).toEqual(["good.mp3"]);
    expect(result.errors).toEqual([
      { input: "https://example.com/bad.mp3", message: "Failed to fetch file: HTTP 404" },
    ]);
  });

  it("never runs more than the configured concurrency at once", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    (fetchFileFromUrl as Mock<any>).mockImplementation(async (url: string) => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return makeFile(url);
    });

    const lines = Array.from({ length: 6 }, (_, i) => `https://example.com/file-${i}.mp3`);
    await importFilesFromLines(lines, 2);

    expect(maxInFlight).toBeLessThanOrEqual(2);
  });
});
