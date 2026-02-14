import { create } from "zustand";

export type CatalogDensity = "comfortable" | "compact";

type CatalogUiState = {
  density: CatalogDensity;
  setDensity: (value: CatalogDensity) => void;
};

export const useCatalogUiStore = create<CatalogUiState>((set) => ({
  density: "comfortable",
  setDensity: (value) => set({ density: value }),
}));
