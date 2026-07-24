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
import type { ComponentType } from "react";
import type { Section } from "../types";

export type NativeNavigationIcon = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

export type SectionTabIconKey =
  | "explore-recent"
  | "explore-scholar"
  | "explore-curation"
  | "library-started"
  | "library-saved"
  | "library-completed"
  | "settings-general"
  | "settings-profile"
  | "settings-legal";

const SECTION_TAB_ICONS: Record<SectionTabIconKey, NativeNavigationIcon> = {
  "explore-recent": Clock,
  "explore-scholar": GraduationCap,
  "explore-curation": Sparkles,
  "library-started": Play,
  "library-saved": Bookmark,
  "library-completed": CheckCircle,
  "settings-general": SlidersHorizontal,
  "settings-profile": User,
  "settings-legal": Scale,
};

export function getSectionTabIcon(section: Section, tabId: string): NativeNavigationIcon | null {
  const key = `${section}-${tabId}` as SectionTabIconKey;
  return SECTION_TAB_ICONS[key] ?? null;
}
