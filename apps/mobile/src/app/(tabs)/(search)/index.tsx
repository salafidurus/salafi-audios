import { SearchHomeScreen } from "@sd/feature-search";
import { useRouter } from "expo-router";

export default function SearchIndex() {
  const router = useRouter();

  return (
    <SearchHomeScreen
      onOpenSearch={() => router.push("/(tabs)/(search)/search")}
      onSelectCategory={(searchKey) =>
        router.push({ pathname: "/(tabs)/(search)/search", params: { searchKey } })
      }
    />
  );
}
