import { routes } from "@sd/core-contracts";
import { useRouter } from "next/navigation";

export function useListingNavigation() {
  const router = useRouter();

  const navigateToListing = (slug: string) => {
    router.push(routes.listings.detail(slug));
  };

  return { navigateToListing };
}
