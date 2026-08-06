import { useAudio } from "@sd/domain-audio";
import { usePathname } from "expo-router";

import { SECTION_TABS, type Section } from "@/features/navigation/types";
import { getRootTabFromPathname, isTabRoute } from "@/features/navigation/utils/tab-route-config";

/** Tabs whose sub-route pill bar is handled by their own in-screen UI, not the bottom accessory. */
const TABS_WITH_OWN_SUBROUTE_UI: string[] = ["home", "explore", "library", "search"];

/**
 * Returns true when the native BottomAccessory slot should be mounted.
 * If false, the slot itself must NOT be rendered — an empty native slot still
 * reserves height on iOS even when its React child returns null.
 */
export function useBottomAccessoryVisible(): boolean {
  const { currentTrack } = useAudio();
  const pathname = usePathname();

  if (!isTabRoute(pathname)) return false;

  const hasMiniPlayer = Boolean(currentTrack);

  const activeRootTab = getRootTabFromPathname(pathname);
  const hasSubroute =
    !TABS_WITH_OWN_SUBROUTE_UI.includes(activeRootTab ?? "") &&
    Boolean(SECTION_TABS[activeRootTab as Section]?.length);

  return hasMiniPlayer || hasSubroute;
}
