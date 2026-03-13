import { SearchProcessing } from "@/features/search/screens/SearchProcessing";
import { useLocalSearchParams } from "expo-router";

export default function SearchProcessingRoute() {
  const { searchKey } = useLocalSearchParams<{ searchKey?: string }>();
  return <SearchProcessing prefill={searchKey} />;
}
