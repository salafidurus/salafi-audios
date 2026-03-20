import { SearchProcessingScreen } from "@sd/feature-search";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function SearchRoute() {
  const router = useRouter();
  const { searchKey } = useLocalSearchParams<{ searchKey?: string }>();

  return (
    <SearchProcessingScreen
      prefill={searchKey}
      onBackPress={() => {
        if (router.canGoBack()) {
          router.back();
          return;
        }

        router.replace("/");
      }}
    />
  );
}
