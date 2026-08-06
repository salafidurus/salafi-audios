import { httpClient, endpoints, type FeedContentItemDto } from "@sd/core-contracts";
import { useQuery } from "@tanstack/react-query";

export type HomePromotionsDto = {
  hero?: {
    listing: FeedContentItemDto | null;
    headline: string | null;
  } | null;
  editorsPicks: FeedContentItemDto[];
};

export function useHomePromotions() {
  return useQuery<HomePromotionsDto>({
    queryKey: ["home", "promotions"],
    queryFn: async () => {
      try {
        return await httpClient<HomePromotionsDto>({
          url: endpoints.listings.promotions,
          method: "GET",
        });
      } catch (err) {
        console.error("Failed to load home promotions", err);
        return { hero: null, editorsPicks: [] };
      }
    },
  });
}
