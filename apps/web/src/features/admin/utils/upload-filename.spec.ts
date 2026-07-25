import { describe, it, expect } from "bun:test";
import { parseUploadFilename, slugify, deriveChildSlug, findSlugMatch } from "./upload-filename";
import type { AdminArrangeLessonDto } from "@sd/core-contracts";

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

describe("slugify", () => {
  it("lowercases and replaces non-alphanumerics with dashes", () => {
    expect(slugify("Al-Kalam (Part 1)")).toBe("al-kalam-part-1");
  });

  it("collapses consecutive separators and trims edge dashes", () => {
    expect(slugify("  --Weird__ Name--  ")).toBe("weird-name");
  });

  it("drops non-latin characters entirely", () => {
    expect(slugify("درس")).toBe("");
  });
});

describe("deriveChildSlug", () => {
  it("prefixes the parent slug", () => {
    expect(deriveChildSlug("ajurumiyyah", "Al Kalam")).toBe("ajurumiyyah-al-kalam");
  });

  it("falls back to the parent slug when the title slugifies to nothing", () => {
    expect(deriveChildSlug("ajurumiyyah", "درس")).toBe("ajurumiyyah");
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
