import { SearchHomeScreen } from "@sd/ui-mobile";
import { useRouter } from "expo-router";

export default function SearchIndex() {
  const router = useRouter();

  return (
    <SearchHomeScreen
      onOpenSearch={() => router.push("/(tabs)/(search)/searchprocessing")}
      onSelectCategory={(searchKey) =>
        router.push({ pathname: "/(tabs)/(search)/searchprocessing", params: { searchKey } })
      }
    />
  );
}
