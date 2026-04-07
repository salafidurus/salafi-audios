import { useRouter } from "expo-router";
import { SearchHomeMobileNativeScreen } from "@sd/feature-search";
import { routes } from "@sd/core-contracts";

export default function SearchIndex() {
  const router = useRouter();

  return (
    <SearchHomeMobileNativeScreen
      onOpenSearch={() => router.push(routes.search)}
      onSelectCategory={(searchKey) =>
        router.push(`${routes.search}?searchKey=${encodeURIComponent(searchKey)}`)
      }
    />
  );
}
