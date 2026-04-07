import { useScholarDetail, useScholarStats } from "../api/catalog.api";

export function useScholarDetailScreen(slug: string) {
  const { data: scholar, isFetching, error } = useScholarDetail(slug);
  const { data: stats } = useScholarStats(slug);

  return {
    scholar,
    stats,
    isFetching,
    error,
  };
}
