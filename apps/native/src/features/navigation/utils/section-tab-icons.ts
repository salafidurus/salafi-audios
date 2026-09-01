/** Maps registered subsection identities to platform-independent icon components. */
import type { ComponentType } from "react";

import {
  Bookmark,
  CheckCircle,
  Clock,
  GraduationCap,
  Play,
  Scale,
  SlidersHorizontal,
  Sparkles,
  User,
} from "lucide-react-native";

import type { Section } from "../types";

/** Captures the color, size, and stroke inputs passed from subsection tab rendering. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- module/declaration comments are both present above.
export type NativeNavigationIcon = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

/** Defines the native section tab icon key contract shared by its consumers. */
export type SectionTabIconKey =
  | "explore-recent"
  | "explore-scholar"
  | "explore-curation"
  | "my-library-started"
  | "my-library-saved"
  | "my-library-completed"
  | "settings-general"
  | "settings-profile"
  | "settings-legal";

const SECTION_TAB_ICONS = {
  "explore-recent": Clock,
  "explore-scholar": GraduationCap,
  "explore-curation": Sparkles,
  "my-library-started": Play,
  "my-library-saved": Bookmark,
  "my-library-completed": CheckCircle,
  "settings-general": SlidersHorizontal,
  "settings-profile": User,
  "settings-legal": Scale,
} satisfies Record<SectionTabIconKey, NativeNavigationIcon>;

function isSectionTabIconKey(value: string): value is SectionTabIconKey {
  return Object.hasOwn(SECTION_TAB_ICONS, value);
}

/** Returns the the section tab icon used by native consumers. */
export function getSectionTabIcon(section: Section, tabId: string): NativeNavigationIcon | null {
  const key = `${section}-${tabId}`;
  if (!isSectionTabIconKey(key)) {
    return null;
  }

  return SECTION_TAB_ICONS[key] ?? null;
}
