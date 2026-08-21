import { httpClient, endpoints, type FeedContentItemDto } from "@sd/core-contracts";
import { useQuery } from "@tanstack/react-query";

type HomePromotions = {
  hero: FeedContentItemDto | null;
  editorsPicks: Array<{
    listing: FeedContentItemDto;
  }>;
};

export function useHomePromotions() {
  return useQuery({
    queryKey: ["home", "promotions"],
    queryFn: async () => {
      try {
        return await httpClient<HomePromotions>({
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
