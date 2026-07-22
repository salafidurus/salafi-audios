"use client";

import {
  useApiQuery,
  queryKeys,
  httpClient,
  endpoints,
  type ListingViewDto,
} from "@sd/core-contracts";
import { LectureDetailScreen } from "@/features/listing/screens/lecture-detail/lecture-detail.screen";
import { ScreenInProgressResponsive } from "@/shared/components/ScreenInProgress/ScreenInProgress";

export type ListingDetailScreenProps = {
  slug: string;
};

export function ListingDetailScreen({ slug }: ListingDetailScreenProps) {
  const { data, isFetching } = useApiQuery<ListingViewDto>(
    queryKeys.listings.detail(slug),
    () =>
      httpClient<ListingViewDto>({
        url: endpoints.listings.detail(slug),
        method: "GET",
      }),
    { enabled: !!slug },
  );

  if (isFetching) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>Loading…</div>;
  }

  if (!data) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>Content not found.</div>;
  }

  if (data.format === "single") {
    return <LectureDetailScreen id={data.id} />;
  }

  return <ScreenInProgressResponsive />;
}
