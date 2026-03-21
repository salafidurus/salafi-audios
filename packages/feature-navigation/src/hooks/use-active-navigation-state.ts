export function useActiveNavigationState() {
  return {
    pathname: "/",
    activeSection: null,
    activeSubsection: null,
    activeTab: null,
    shellMode: "launcher" as const,
    showSectionLauncher: false,
    showSectionSwitcher: false,
    showSearchShortcut: false,
    canOpenSectionSwitcher: false,
    searchHref: "/",
    resolveSectionHref: (_section: string) => "/",
  };
}
