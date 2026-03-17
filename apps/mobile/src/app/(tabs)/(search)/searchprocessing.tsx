import { SearchProcessingScreen } from "@sd/ui-mobile";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";

export default function SearchProcessingRoute() {
  const router = useRouter();
  const { searchKey } = useLocalSearchParams<{ searchKey?: string }>();

  return (
    <SearchProcessingScreen
      prefill={searchKey}
      onBackPress={() => {
        if (router.canGoBack()) {
          router.back();
        }
      }}
    />
  );
}
