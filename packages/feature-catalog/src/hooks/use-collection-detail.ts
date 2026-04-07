import { useCollectionDetail } from "../api/catalog.api";

export function useCollectionDetailScreen(id: string) {
  const { data: collection, isFetching, error } = useCollectionDetail(id);

  return {
    collection,
    isFetching,
    error,
  };
}
