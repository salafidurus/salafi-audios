import { useCallback, useEffect, useMemo } from "react";
import { usePathname } from "expo-router";
import { useNavigationStore } from "../store/navigation-store";
import { buildSearchHomeHref, buildSectionHref, getActiveNavigationState } from "../utils/shell-navigation.native";
import type { Section } from "../types";

export function useActiveNavigationState() {
  const pathname = usePathname();
  const rememberedTabs = useNavigationStore((state) => state.sectionTabs);
  const setActiveTab = useNavigationStore((state) => state.setActiveTab);

  const navigationState = useMemo(
    () => getActiveNavigationState(pathname, rememberedTabs),
    [pathname, rememberedTabs],
  );

  useEffect(() => {
    if (!navigationState.activeSection || !navigationState.activeSubsection) {
      return;
    }

    if (rememberedTabs[navigationState.activeSection] === navigationState.activeSubsection) {
      return;
    }

    setActiveTab(navigationState.activeSection, navigationState.activeSubsection);
  }, [navigationState.activeSection, navigationState.activeSubsection, rememberedTabs, setActiveTab]);

  const resolveSectionHref = useCallback(
    (section: Section) => buildSectionHref(section, rememberedTabs[section]),
    [rememberedTabs],
  );

  return {
    ...navigationState,
    searchHref: buildSearchHomeHref(),
    resolveSectionHref,
  };
}
