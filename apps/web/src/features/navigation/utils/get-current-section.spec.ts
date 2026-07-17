import { describe, it, expect } from "bun:test";
import {
  getCurrentSection,
  getActiveTabFromPath,
  buildSectionTabPath,
} from "./get-current-section";

describe("getCurrentSection", () => {
  it("returns explore for /explore", () => {
    expect(getCurrentSection("/explore")).toBe("explore");
  });
  it("returns explore for /explore/recent", () => {
    expect(getCurrentSection("/explore/recent")).toBe("explore");
  });
  it("returns library for /library", () => {
    expect(getCurrentSection("/library")).toBe("library");
  });
  it("returns home for root path /", () => {
    expect(getCurrentSection("/")).toBe("home");
  });
  it("returns home for unmatched paths", () => {
    expect(getCurrentSection("/scholars/some-slug")).toBe("home");
  });
  it("returns settings for /settings", () => {
    expect(getCurrentSection("/settings")).toBe("settings");
  });
  it("returns adminContents for /admin/contents", () => {
    expect(getCurrentSection("/admin/contents")).toBe("adminContents");
  });
  it("returns adminContents for /admin/contents/topics", () => {
    expect(getCurrentSection("/admin/contents/topics")).toBe("adminContents");
  });
});

describe("getActiveTabFromPath", () => {
  it("returns null for single-segment paths", () => {
    expect(getActiveTabFromPath("/explore")).toBeNull();
  });
  it("returns the second segment", () => {
    expect(getActiveTabFromPath("/explore/recent")).toBe("recent");
  });
  it("returns null for root path", () => {
    expect(getActiveTabFromPath("/")).toBeNull();
  });
  it("returns tab for admin/contents", () => {
    expect(getActiveTabFromPath("/admin/contents/listings")).toBe("listings");
  });
});

describe("buildSectionTabPath", () => {
  it("returns correct path for adminContents topics", () => {
    expect(buildSectionTabPath("adminContents", "topics")).toBe("/admin/contents");
  });
  it("returns correct path for adminContents listings", () => {
    expect(buildSectionTabPath("adminContents", "listings")).toBe("/admin/contents/listings");
  });
});
