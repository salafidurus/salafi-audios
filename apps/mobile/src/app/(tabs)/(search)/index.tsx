import { SearchHomeMobileNativeScreen } from "@sd/feature-search";
import { type Href, useRouter } from "expo-router";

export default function SearchIndex() {
  const router = useRouter();
  const searchRoute = "/(tabs)/(search)/search" as Href;

  return (
    <SearchHomeMobileNativeScreen
      onOpenSearch={() => router.push(searchRoute)}
      onSelectCategory={(searchKey) =>
        router.push({ pathname: searchRoute, params: { searchKey } } as Href)
      }
    />
  );
}
