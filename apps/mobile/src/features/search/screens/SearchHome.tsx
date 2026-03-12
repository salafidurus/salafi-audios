import { SearchBar } from "../components/SearchBar";
import { ScreenView } from "@/shared/components/ScreenView";

export function SearchHome() {
  return (
    <ScreenView>
      <SearchBar placeholder="Search..." />
    </ScreenView>
  );
}
