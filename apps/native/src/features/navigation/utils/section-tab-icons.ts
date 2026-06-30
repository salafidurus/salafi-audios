import {
  Bookmark,
  Calendar,
  CheckCircle,
  CircleCheck,
  Clock,
  Flame,
  Heart,
  Play,
  Radio,
  Scale,
  SlidersHorizontal,
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
  | "feed-popular"
  | "feed-recent"
  | "feed-following"
  | "live-ongoing"
  | "live-scheduled"
  | "live-ended"
  | "library-started"
  | "library-saved"
  | "library-completed"
  | "settings-general"
  | "settings-profile"
  | "settings-legal";

const SECTION_TAB_ICONS: Record<SectionTabIconKey, NativeNavigationIcon> = {
  "feed-popular": Flame,
  "feed-recent": Clock,
  "feed-following": Heart,
  "live-ongoing": Radio,
  "live-scheduled": Calendar,
  "live-ended": CircleCheck,
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
