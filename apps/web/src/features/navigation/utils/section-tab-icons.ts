import {
  Bookmark,
  CheckCircle,
  Clock,
  Flame,
  Heart,
  Play,
  SlidersHorizontal,
  User,
  type LucideIcon,
} from "lucide-react";
import type { Section } from "../types";

export type SectionTabIconKey =
  | "feed-popular"
  | "feed-recent"
  | "feed-following"
  | "library-started"
  | "library-saved"
  | "library-completed"
  | "account-general"
  | "account-profile";

const SECTION_TAB_ICONS: Record<SectionTabIconKey, LucideIcon> = {
  "feed-popular": Flame,
  "feed-recent": Clock,
  "feed-following": Heart,
  "library-started": Play,
  "library-saved": Bookmark,
  "library-completed": CheckCircle,
  "account-general": SlidersHorizontal,
  "account-profile": User,
};

export function getSectionTabIcon(section: Section, tabId: string): LucideIcon | null {
  const key = `${section}-${tabId}` as SectionTabIconKey;
  return SECTION_TAB_ICONS[key] ?? null;
}
