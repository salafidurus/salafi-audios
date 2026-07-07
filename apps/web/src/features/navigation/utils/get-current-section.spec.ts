import { getCurrentSection, getActiveTabFromPath } from "./get-current-section";

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
  it("returns live for /live", () => {
    expect(getCurrentSection("/live")).toBe("live");
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
});
