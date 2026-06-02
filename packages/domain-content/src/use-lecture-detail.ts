import { useLectureDetail } from "./lecture.api";

export function useLectureDetailScreen(id: string) {
  const { data: lecture, isFetching, error } = useLectureDetail(id);

  return {
    lecture,
    isFetching,
    error,
  };
}
