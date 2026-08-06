import { getRootTabFromPathname, getActiveSubsection } from "./tab-route-config";

jest.mock("lucide-react-native", () => ({
  BookOpen: "BookOpen",
  Cloud: "Cloud",
  Search: "Search",
  Settings: "Settings",
}));

describe("getRootTabFromPathname", () => {
  it("returns home for root path /", () => {
    expect(getRootTabFromPathname("/")).toBe("home");
  });
  it("returns search for /search", () => {
    expect(getRootTabFromPathname("/search")).toBe("search");
  });
  it("returns explore for /explore", () => {
    expect(getRootTabFromPathname("/explore")).toBe("explore");
  });
  it("returns explore for /explore/recent", () => {
    expect(getRootTabFromPathname("/explore/recent")).toBe("explore");
  });
  it("returns explore for /explore/all", () => {
    expect(getRootTabFromPathname("/explore/all")).toBe("explore");
  });
  it("redirects legacy bare sub-routes to explore", () => {
    expect(getRootTabFromPathname("/recent")).toBe("explore");
  });
  it("returns library for /library", () => {
    expect(getRootTabFromPathname("/library")).toBe("library");
  });
  it("returns library for /library/saved", () => {
    expect(getRootTabFromPathname("/library/saved")).toBe("library");
  });
  it("returns settings for /settings", () => {
    expect(getRootTabFromPathname("/settings")).toBe("settings");
  });
  it("returns home for unknown paths", () => {
    expect(getRootTabFromPathname("/unknown")).toBe("home");
  });
});

describe("getActiveSubsection", () => {
  it("returns recent for the explore root (default)", () => {
    expect(getActiveSubsection("/explore", "explore")).toBe("recent");
  });
  it("returns all for /explore/all", () => {
    expect(getActiveSubsection("/explore/all", "explore")).toBe("all");
  });
  it("returns home for root path", () => {
    expect(getActiveSubsection("/", "home")).toBe("home");
  });
  it("returns matched subsection", () => {
    expect(getActiveSubsection("/explore/recent", "explore")).toBe("recent");
  });
  it("returns default tab for unrecognized subsection", () => {
    expect(getActiveSubsection("/explore/unknown", "explore")).toBe("recent");
  });
  it("returns default library tab for bare path", () => {
    expect(getActiveSubsection("/library", "library")).toBe("started");
  });
  it("returns matched library subsection", () => {
    expect(getActiveSubsection("/library/saved", "library")).toBe("saved");
  });
  it("strips trailing slash", () => {
    expect(getActiveSubsection("/explore/recent/", "explore")).toBe("recent");
  });
});
