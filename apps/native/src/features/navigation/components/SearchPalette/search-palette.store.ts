/** Provides the app-global transient state used to present and dismiss search. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- module responsibility is documented above.
import { create } from "zustand";

type SearchPaletteState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

/** Owns the app-global transient visibility state for the native search palette. */
export const useSearchPaletteStore = create<SearchPaletteState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
