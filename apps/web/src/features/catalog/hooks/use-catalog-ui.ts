import { useCatalogUiStore } from "@/features/catalog/store/catalog-ui.store";

export function useCatalogUi() {
  const density = useCatalogUiStore((state) => state.density);
  const setDensity = useCatalogUiStore((state) => state.setDensity);

  return { density, setDensity };
}
