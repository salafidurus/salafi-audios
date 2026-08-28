import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";

/** Describes the useListingNavigation native contract and behavior. */
/** Describes the useListingNavigation native function contract and behavior. */
export function useListingNavigation() {
  const router = useRouter();

  const navigateToListing = (slug: string) => {
    router.push(routes.listings.detail(slug));
  };

  return { navigateToListing };
}
