import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_TABS, type Section } from "../types";

type NavigationState = {
  sectionTabs: Record<Section, string>;
  setActiveTab: (section: Section, tab: string) => void;
};

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      sectionTabs: { ...DEFAULT_TABS },
      setActiveTab: (section, tab) =>
        set((state) => ({
          sectionTabs: { ...state.sectionTabs, [section]: tab },
        })),
    }),
    {
      name: "sd-navigation",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
