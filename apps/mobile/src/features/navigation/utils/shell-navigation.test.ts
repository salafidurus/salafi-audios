import {
  buildSearchHomeHref,
  buildSectionHref,
  getActiveNavigationState,
  getActiveTabFromPath,
  getCurrentSection,
} from "../../../../../../packages/feature-navigation/src/utils/shell-navigation.native";
import { DEFAULT_TABS, type Section } from "../../../../../../packages/feature-navigation/src/types.native";

function createRememberedTabs(
  overrides: Partial<Record<Section, string>> = {},
): Record<Section, string> {
  return {
    ...DEFAULT_TABS,
    ...overrides,
  };
}

describe("shell navigation utilities", () => {
  it("parses normalized public pathnames for the active section and subsection", () => {
    expect(getCurrentSection("/feed/popular")).toBe("feed");
    expect(getActiveTabFromPath("/feed/popular")).toBe("popular");
  });

  it("parses grouped internal hrefs for the active section and subsection", () => {
    expect(getCurrentSection("/(shell)/(live)/ongoing")).toBe("live");
    expect(getActiveTabFromPath("/(shell)/(live)/ongoing")).toBe("ongoing");
  });

  it("builds grouped internal hrefs using remembered subsection targets", () => {
    expect(buildSectionHref("library", "completed")).toBe("/(shell)/(library)/completed");
    expect(buildSearchHomeHref()).toBe("/(shell)/(search)/");
  });

  it("falls back to remembered subsection state when the route subsection is invalid", () => {
    const rememberedTabs = createRememberedTabs({ live: "ongoing" });

    const state = getActiveNavigationState("/(shell)/(live)/unknown", rememberedTabs);

    expect(state.activeSection).toBe("live");
    expect(state.activeSubsection).toBeNull();
    expect(state.activeTab).toBe("ongoing");
    expect(state.pathname).toBe("/live/unknown");
  });

  it("preserves section re-entry memory for live when re-entering the section", () => {
    const rememberedTabs = createRememberedTabs({ live: "ongoing" });

    expect(buildSectionHref("live", rememberedTabs.live)).toBe("/(shell)/(live)/ongoing");
  });

  it("treats search routes as launcher mode while preserving normalized path shape", () => {
    const state = getActiveNavigationState("/(shell)/(search)/search", createRememberedTabs());

    expect(state.shellMode).toBe("launcher");
    expect(state.activeSection).toBeNull();
    expect(state.pathname).toBe("/search/search");
  });
});
