import { getRootTabFromPathname, getActiveSubsection } from "./tab-route-config";

jest.mock("lucide-react-native", () => ({
  BookOpen: "BookOpen",
  Cloud: "Cloud",
  Search: "Search",
  Settings: "Settings",
}));

describe("getRootTabFromPathname", () => {
  it("returns explore for root path /", () => {
    expect(getRootTabFromPathname("/")).toBe("explore");
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
  it("returns library for /my-library", () => {
    expect(getRootTabFromPathname("/my-library")).toBe("myLibrary");
  });
  it("returns library for /my-library/saved", () => {
    expect(getRootTabFromPathname("/my-library/saved")).toBe("myLibrary");
  });
  it("returns settings for /settings", () => {
    expect(getRootTabFromPathname("/settings")).toBe("settings");
  });
  it("returns explore for unknown paths", () => {
    expect(getRootTabFromPathname("/unknown")).toBe("explore");
  });
});

describe("getActiveSubsection", () => {
  it("returns default tab when no subsection", () => {
    expect(getActiveSubsection("/", "explore")).toBe("recent");
  });
  it("returns matched subsection", () => {
    expect(getActiveSubsection("/recent", "explore")).toBe("recent");
  });
  it("returns default tab for unrecognized subsection", () => {
    expect(getActiveSubsection("/unknown", "explore")).toBe("recent");
  });
  it("returns matched library subsection", () => {
    expect(getActiveSubsection("/my-library/saved", "myLibrary")).toBe("saved");
  });
  it("returns default library tab for bare path", () => {
    expect(getActiveSubsection("/my-library", "myLibrary")).toBe("started");
  });
  it("strips trailing slash", () => {
    expect(getActiveSubsection("/recent/", "explore")).toBe("recent");
  });
});
