import { create } from "zustand";

export type LibraryDensity = "comfortable" | "compact";

type LibraryUiState = {
  density: LibraryDensity;
  setDensity: (value: LibraryDensity) => void;
};

export const useLibraryUiStore = create<LibraryUiState>((set) => ({
  density: "comfortable",
  setDensity: (value) => set({ density: value }),
}));
