import type { Href } from "expo-router";

import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";

export function useListingNavigation() {
  const router = useRouter();

  const navigateToListing = (slug: string) => {
    router.push(routes.listings.detail(slug) as Href);
  };

  return { navigateToListing };
}
