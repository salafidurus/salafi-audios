import { routes } from "@sd/core-contracts";
import { useRouter } from "next/navigation";

/** Documents this module's responsibility and public boundary. */
export function useListingNavigation() {
  const router = useRouter();

  const navigateToListing = (slug: string) => {
    router.push(routes.listings.detail(slug));
  };

  return { navigateToListing };
}
