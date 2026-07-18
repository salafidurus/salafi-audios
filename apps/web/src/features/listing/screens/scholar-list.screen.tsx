"use client";

import { useRouter } from "next/navigation";
import { routes, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { ScholarListRow } from "@/features/listing/components/scholar/scholar-list-row/scholar-list-row";
import type { ScholarListDto } from "@sd/core-contracts";
import styles from "./scholar-list.screen.module.css";

export function ScholarListScreen() {
  const { push } = useRouter();

  const handleSelectScholar = (slug: string) => {
    push(routes.scholars.detail(slug));
  };

  return (
    <ScreenView>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Scholars</h1>
          <p className={styles.tagline}>Browse our database of authentic scholars</p>
        </div>
        <div className={styles.list}>
          <InfiniteScrollList
            queryKey={[...queryKeys.scholars.list.infinite()]}
            queryFn={async ({ pageParam }: { pageParam?: string | undefined }) => {
              const params = new URLSearchParams();
              if (pageParam) params.append("cursor", pageParam);
              const url = `${endpoints.scholars.list}${params.size > 0 ? `?${params}` : ""}`;
              const response = await httpClient<ScholarListDto>({ url, method: "GET" });
              return {
                items: response.scholars,
                nextCursor: response.nextCursor,
                hasMore: response.hasMore,
              };
            }}
            renderItem={(scholar) => (
              <ScholarListRow key={scholar.id} scholar={scholar} onPress={handleSelectScholar} />
            )}
            emptyMessage="No scholars found."
          />
        </div>
      </div>
    </ScreenView>
  );
}
