import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type NavigationState = {
  isMobileDrawerOpen: boolean;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  toggleMobileDrawer: () => void;
};

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
