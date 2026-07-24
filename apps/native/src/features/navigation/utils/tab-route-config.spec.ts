import { getRootTabFromPathname, getActiveSubsection } from "./tab-route-config";

jest.mock("lucide-react-native", () => ({
  BookOpen: "BookOpen",
  Cloud: "Cloud",
  Search: "Search",
  Settings: "Settings",
}));

describe("getRootTabFromPathname", () => {
  it("returns search for root path /", () => {
    expect(getRootTabFromPathname("/")).toBe("search");
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
  it("returns library for /library", () => {
    expect(getRootTabFromPathname("/library")).toBe("library");
  });
  it("returns library for /library/saved", () => {
    expect(getRootTabFromPathname("/library/saved")).toBe("library");
  });
  it("returns settings for /settings", () => {
    expect(getRootTabFromPathname("/settings")).toBe("settings");
  });
  it("returns search for unknown paths", () => {
    expect(getRootTabFromPathname("/unknown")).toBe("search");
  });
});

describe("getActiveSubsection", () => {
  it("returns default tab when no subsection", () => {
    expect(getActiveSubsection("/explore", "explore")).toBe("recent");
  });
  it("returns matched subsection", () => {
    expect(getActiveSubsection("/explore/recent", "explore")).toBe("recent");
  });
  it("returns default tab for unrecognized subsection", () => {
    expect(getActiveSubsection("/explore/unknown", "explore")).toBe("recent");
  });
  it("returns matched library subsection", () => {
    expect(getActiveSubsection("/library/saved", "library")).toBe("saved");
  });
  it("returns default library tab for bare path", () => {
    expect(getActiveSubsection("/library", "library")).toBe("started");
  });
  it("strips trailing slash", () => {
    expect(getActiveSubsection("/explore/recent/", "explore")).toBe("recent");
  });
});
