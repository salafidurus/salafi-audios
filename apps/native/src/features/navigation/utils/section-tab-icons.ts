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

/** Provides the native features navigation utils section-tab-icons module responsibility. */
/** Describes the NativeNavigationIcon native type contract and behavior. */
export type NativeNavigationIcon = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

/** Describes the SectionTabIconKey native type contract and behavior. */
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

/** Describes the getSectionTabIcon native function contract and behavior. */
export function getSectionTabIcon(section: Section, tabId: string): NativeNavigationIcon | null {
  const key = `${section}-${tabId}`;
  if (!isSectionTabIconKey(key)) {
    return null;
  }

  return SECTION_TAB_ICONS[key] ?? null;
}
