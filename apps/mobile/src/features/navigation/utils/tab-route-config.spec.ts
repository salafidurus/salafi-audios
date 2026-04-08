jest.mock("lucide-react-native", () => ({
  BookOpen: "BookOpen",
  Cloud: "Cloud",
  Mic: "Mic",
  Search: "Search",
  Settings: "Settings",
}));

import { getRootTabFromPathname, getActiveSubsection } from "./tab-route-config";

describe("getRootTabFromPathname", () => {
  it("returns search for root path /", () => {
    expect(getRootTabFromPathname("/")).toBe("search");
  });
  it("returns search for /search", () => {
    expect(getRootTabFromPathname("/search")).toBe("search");
  });
  it("returns feed for /feed", () => {
    expect(getRootTabFromPathname("/feed")).toBe("feed");
  });
  it("returns feed for /feed/recent", () => {
    expect(getRootTabFromPathname("/feed/recent")).toBe("feed");
  });
  it("returns live for /live", () => {
    expect(getRootTabFromPathname("/live")).toBe("live");
  });
  it("returns library for /library", () => {
    expect(getRootTabFromPathname("/library")).toBe("library");
  });
  it("returns library for /library/saved", () => {
    expect(getRootTabFromPathname("/library/saved")).toBe("library");
  });
  it("returns account for /account", () => {
    expect(getRootTabFromPathname("/account")).toBe("account");
  });
  it("returns search for unknown paths", () => {
    expect(getRootTabFromPathname("/unknown")).toBe("search");
  });
});

describe("getActiveSubsection", () => {
  it("returns default tab when no subsection", () => {
    expect(getActiveSubsection("/feed", "feed")).toBe("popular");
  });
  it("returns matched subsection", () => {
    expect(getActiveSubsection("/feed/recent", "feed")).toBe("recent");
  });
  it("returns default tab for unrecognized subsection", () => {
    expect(getActiveSubsection("/feed/unknown", "feed")).toBe("popular");
  });
  it("returns matched library subsection", () => {
    expect(getActiveSubsection("/library/saved", "library")).toBe("saved");
  });
  it("returns default library tab for bare path", () => {
    expect(getActiveSubsection("/library", "library")).toBe("started");
  });
  it("strips trailing slash", () => {
    expect(getActiveSubsection("/feed/recent/", "feed")).toBe("recent");
  });
});
