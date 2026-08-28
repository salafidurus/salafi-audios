import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";

/** Builds listing navigation actions while preserving the app’s canonical route identities. */
/** Provides listing navigation state and behavior to native consumers. */
export function useListingNavigation() {
  const router = useRouter();

  const navigateToListing = (slug: string) => {
    router.push(routes.listings.detail(slug));
  };

  return { navigateToListing };
}
