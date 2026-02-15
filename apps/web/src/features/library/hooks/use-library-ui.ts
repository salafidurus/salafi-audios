import { useLibraryUiStore } from "@/features/library/store/library-ui.store";

export function useLibraryUi() {
  const density = useLibraryUiStore((state) => state.density);
  const setDensity = useLibraryUiStore((state) => state.setDensity);

  return { density, setDensity };
}
