import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type HomePromotionsDto,
} from "@sd/core-contracts";

/** Provides the public Home promotions query for Catalog clients. */
/**
 * Reads the canonical public Home promotions projection without requiring an authenticated session.
 * The query remains independently cacheable so anonymous clients can render public content safely.
 */
export function useHomePromotions() {
  return useApiQuery<HomePromotionsDto>([...queryKeys.listings.all, "promotions"], () =>
    httpClient<HomePromotionsDto>({
      url: endpoints.listings.promotions,
      method: "GET",
    }),
  );
}
