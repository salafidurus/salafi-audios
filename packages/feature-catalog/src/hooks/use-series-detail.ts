import { useSeriesDetail } from "../api/catalog.api";

export function useSeriesDetailScreen(id: string) {
  const { data: series, isFetching, error } = useSeriesDetail(id);

  return {
    series,
    isFetching,
    error,
  };
}
