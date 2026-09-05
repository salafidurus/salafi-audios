import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** Documents this module's responsibility and public boundary. */
type NavigationState = {
  isMobileDrawerOpen: boolean;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  toggleMobileDrawer: () => void;
};

/** Persists the mobile drawer state and exposes transitions used by navigation controls. */
export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      isMobileDrawerOpen: false,
      openMobileDrawer: () => set({ isMobileDrawerOpen: true }),
      closeMobileDrawer: () => set({ isMobileDrawerOpen: false }),
      toggleMobileDrawer: () =>
        set((state) => ({
          isMobileDrawerOpen: !state.isMobileDrawerOpen,
        })),
    }),
    {
      name: "sd-navigation",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
