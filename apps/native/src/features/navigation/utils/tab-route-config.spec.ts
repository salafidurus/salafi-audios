import { getRootTabFromPathname, isTabRoute } from "./tab-route-config";

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
  it("returns explore for /explore", () => {
    expect(getRootTabFromPathname("/explore")).toBe("explore");
  });
  it("returns scholars for /scholars", () => {
    expect(getRootTabFromPathname("/scholars")).toBe("scholars");
  });
  it("returns my library for /my-library", () => {
    expect(getRootTabFromPathname("/my-library")).toBe("myLibrary");
  });
  it("returns settings for /settings", () => {
    expect(getRootTabFromPathname("/settings")).toBe("settings");
  });

  it.each(["/search", "/listings/example", "/admin", "/unknown"])(
    "does not treat %s as a persistent root",
    (pathname) => {
      expect(getRootTabFromPathname(pathname)).toBeNull();
    },
  );
});

describe("isTabRoute", () => {
  it.each(["/", "/explore", "/scholars", "/my-library", "/settings"])(
    "recognizes %s as a root route",
    (pathname) => {
      expect(isTabRoute(pathname)).toBe(true);
    },
  );

  it.each(["/recent", "/scholar", "/curation", "/my-library/saved", "/my-library/completed"])(
    "rejects obsolete native sub-route %s",
    (pathname) => {
      expect(isTabRoute(pathname)).toBe(false);
    },
  );
});

/* Legacy subsection helpers intentionally no longer exist. */
describe("removed subsection navigation", () => {
  it("does not expose subsection route behavior through the root contract", () => {
    expect(getRootTabFromPathname("/my-library/saved")).toBeNull();
  });
});
