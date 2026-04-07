import { useScholarDetail, useScholarContent } from "../api/scholar.api";

export function useScholarDetailScreen(slug: string) {
  const { data: scholar, isFetching: isScholarFetching } = useScholarDetail(slug);
  const { data: content, isFetching: isContentFetching } = useScholarContent(slug);

  return {
    scholar,
    content,
    isFetching: isScholarFetching || isContentFetching,
  };
}
