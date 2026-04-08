import { SearchProcessingMobileNativeScreen } from "../../../../features/search/screens/search-processing/search-processing.screen";
import { useLocalSearchParams, useRouter } from "expo-router";
import { routes } from "@sd/core-contracts";

export default function SearchRoute() {
  const router = useRouter();
  const { searchKey } = useLocalSearchParams<{ searchKey?: string }>();

  return (
    <SearchProcessingMobileNativeScreen
      prefill={searchKey}
      onBackPress={() => {
        if (router.canGoBack()) {
          router.back();
          return;
        }
        router.replace(routes.home);
      }}
    />
  );
}
