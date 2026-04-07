import { getCurrentSection, getActiveTabFromPath } from "./get-current-section.web";

describe("getCurrentSection", () => {
  it("returns feed for /feed", () => { expect(getCurrentSection("/feed")).toBe("feed"); });
  it("returns feed for /feed/recent", () => { expect(getCurrentSection("/feed/recent")).toBe("feed"); });
  it("returns library for /library", () => { expect(getCurrentSection("/library")).toBe("library"); });
  it("returns live for /live", () => { expect(getCurrentSection("/live")).toBe("live"); });
  it("returns home for root path /", () => { expect(getCurrentSection("/")).toBe("home"); });
  it("returns home for unmatched paths", () => { expect(getCurrentSection("/scholars/some-slug")).toBe("home"); });
  it("returns account for /account", () => { expect(getCurrentSection("/account")).toBe("account"); });
});

describe("getActiveTabFromPath", () => {
  it("returns null for single-segment paths", () => { expect(getActiveTabFromPath("/feed")).toBeNull(); });
  it("returns the second segment", () => { expect(getActiveTabFromPath("/feed/recent")).toBe("recent"); });
  it("returns null for root path", () => { expect(getActiveTabFromPath("/")).toBeNull(); });
});