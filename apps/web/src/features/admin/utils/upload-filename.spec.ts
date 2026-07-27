import type { AdminArrangeLessonDto } from "@sd/core-contracts";

import { describe, it, expect } from "bun:test";

import { parseUploadFilename, slugify, findSlugMatch } from "./upload-filename";

describe("parseUploadFilename", () => {
  it("extracts a numeric prefix, title, and extension", () => {
    expect(parseUploadFilename("001 Al-Kalam.mp3")).toEqual({
      title: "Al-Kalam",
      numericPrefix: 1,
      ext: "mp3",
    });
  });

  it("supports dot, underscore, and dash separators after the prefix", () => {
    expect(parseUploadFilename("12_Intro Lesson.m4a").numericPrefix).toBe(12);
    expect(parseUploadFilename("12-Intro.m4a").numericPrefix).toBe(12);
    expect(parseUploadFilename("12.Intro.m4a").numericPrefix).toBe(12);
  });

  it("returns null prefix when the filename has no leading number", () => {
    expect(parseUploadFilename("Sharh Kitab at-Tawhid.mp3")).toEqual({
      title: "Sharh Kitab at-Tawhid",
      numericPrefix: null,
      ext: "mp3",
    });
  });

  it("does not treat a purely numeric title as a prefix", () => {
    // "2024.mp3" has no separator+title after the digits — it's a title, not a prefix
    expect(parseUploadFilename("2024.mp3")).toEqual({
      title: "2024",
      numericPrefix: null,
      ext: "mp3",
    });
  });

  it("handles filenames without an extension", () => {
    expect(parseUploadFilename("no-extension")).toEqual({
      title: "no-extension",
      numericPrefix: null,
      ext: "",
    });
  });
});

describe("slugify (re-exported from ./slugify)", () => {
  it("is the same canonical implementation used elsewhere", () => {
    expect(slugify("Al-Kalam (Part 1)")).toBe("al-kalam-part-1");
  });
});

describe("findSlugMatch", () => {
  const lessons: AdminArrangeLessonDto[] = [
    { id: "l1", slug: "ajurumiyyah-kalam", title: "Kalam", status: "published", hasAudio: true },
  ];

  it("returns the lesson whose slug matches", () => {
    expect(findSlugMatch("ajurumiyyah-kalam", lessons)?.id).toBe("l1");
  });

  it("returns null when nothing matches", () => {
    expect(findSlugMatch("ajurumiyyah-asmaa", lessons)).toBeNull();
  });
});
