import { endpoints, httpClient, type HomePromotionsDto } from "@sd/core-contracts";
import { useQuery } from "@tanstack/react-query";

/** Documents this module's responsibility and public boundary. */
export function useHomePromotions() {
  return useQuery({
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
