import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_TABS, type Section } from "../types";

type NavigationState = {
  // Tab management
  sectionTabs: Record<Section, string>;
  setActiveTab: (section: Section, tab: string) => void;

  // Mobile drawer
  isMobileDrawerOpen: boolean;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;

  // Tablet sidebar (persisted, default collapsed)
  isTabletSidebarCollapsed: boolean;
  toggleTabletSidebar: () => void;

  // Desktop sidebar (persisted, default expanded)
  isDesktopSidebarCollapsed: boolean;
  toggleDesktopSidebar: () => void;
};

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      // Tab management
      sectionTabs: { ...DEFAULT_TABS },
      setActiveTab: (section, tab) =>
        set((state) => ({
          sectionTabs: { ...state.sectionTabs, [section]: tab },
        })),

      // Mobile drawer (not persisted - transient state)
      isMobileDrawerOpen: false,
      openMobileDrawer: () => set({ isMobileDrawerOpen: true }),
      closeMobileDrawer: () => set({ isMobileDrawerOpen: false }),

      // Tablet sidebar (persisted, default collapsed)
      isTabletSidebarCollapsed: true,
      toggleTabletSidebar: () =>
        set((state) => ({
          isTabletSidebarCollapsed: !state.isTabletSidebarCollapsed,
        })),

      // Desktop sidebar (persisted, default expanded)
      isDesktopSidebarCollapsed: false,
      toggleDesktopSidebar: () =>
        set((state) => ({
          isDesktopSidebarCollapsed: !state.isDesktopSidebarCollapsed,
        })),
    }),
    {
      name: "sd-navigation",
      storage: createJSONStorage(() => localStorage),
      // Don't persist mobile drawer state (transient)
      partialize: (state) => ({
        sectionTabs: state.sectionTabs,
        isTabletSidebarCollapsed: state.isTabletSidebarCollapsed,
        isDesktopSidebarCollapsed: state.isDesktopSidebarCollapsed,
      }),
    },
  ),
);
