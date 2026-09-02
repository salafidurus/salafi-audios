import { describe, it, expect } from "bun:test";

import { parseGoogleDriveLink, buildGoogleDriveDownloadUrl } from "./google-drive-import";

describe("parseGoogleDriveLink", () => {
  it("extracts the file id from a /file/d/{id}/view link", () => {
    expect(
      parseGoogleDriveLink(
        "https://drive.google.com/file/d/18lIEO3tRKO7CGfF5kZ3dGFDHeLMStkZm/view?usp=sharing",
      ),
    ).toEqual({ kind: "file", fileId: "18lIEO3tRKO7CGfF5kZ3dGFDHeLMStkZm" });
  });

  it("extracts the file id from a compatibility uc?id= link", () => {
    expect(
      parseGoogleDriveLink("https://drive.google.com/uc?export=download&id=abc123XYZ"),
    ).toEqual({ kind: "file", fileId: "abc123XYZ" });
  });

  it("extracts the file id from a drive.usercontent.google.com download link", () => {
    expect(
      parseGoogleDriveLink(
        "https://drive.usercontent.google.com/download?id=abc123XYZ&export=download",
      ),
    ).toEqual({ kind: "file", fileId: "abc123XYZ" });
  });

  it("flags a folder link as an unsupported source instead of parsing a file id", () => {
    expect(
      parseGoogleDriveLink(
        "https://drive.google.com/drive/folders/10mcTouSHjldZEguyWQ8cBgob1x4PrDHN?usp=drive_link",
      ),
    ).toEqual({ kind: "unsupported-folder" });
  });

  it("returns null for a non-Drive URL", () => {
    expect(parseGoogleDriveLink("https://archive.org/details/ArafatTranslation")).toBeNull();
  });
});

describe("buildGoogleDriveDownloadUrl", () => {
  it("builds the CORS-friendly content-serving URL for a file id", () => {
    expect(buildGoogleDriveDownloadUrl("abc123XYZ")).toBe(
      "https://drive.usercontent.google.com/download?id=abc123XYZ&export=download&authuser=0",
    );
  });
});
