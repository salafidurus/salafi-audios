import {
  Bookmark,
  CheckCircle,
  Clock,
  GraduationCap,
  Play,
  SlidersHorizontal,
  Sparkles,
  User,
  type LucideIcon,
} from "lucide-react";
import type { Section } from "../types";

export type SectionTabIconKey =
  | "explore-recent"
  | "explore-scholar"
  | "explore-curation"
  | "library-started"
  | "library-saved"
  | "library-completed"
  | "account-general"
  | "account-profile";

const SECTION_TAB_ICONS: Record<SectionTabIconKey, LucideIcon> = {
  "explore-recent": Clock,
  "explore-scholar": GraduationCap,
  "explore-curation": Sparkles,
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
