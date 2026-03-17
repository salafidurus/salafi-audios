import type { Section } from "../types";

const SECTION_MAP: Record<string, Section> = {
  "(feed)": "feed",
  "(live)": "live",
  "(library)": "library",
  "(account)": "account",
};

export function getCurrentSection(segments: string[]): Section | "home" {
  // segments after (tabs): e.g. ["(tabs)", "(feed)", "popular"]
  const tabsIndex = segments.indexOf("(tabs)");
  const sectionSegment = tabsIndex >= 0 ? segments[tabsIndex + 1] : segments[1];

  if (!sectionSegment) return "home";

  if (sectionSegment === "(search)") return "home";

  return SECTION_MAP[sectionSegment] ?? "home";
}
