import { routes } from "@sd/core-contracts";
import { useRouter } from "next/navigation";

/** Documents this module's responsibility and public boundary. */
/**
 * Provides navigation to the canonical detail route for a listing slug.
 *
 * The returned callback preserves the slug as the route's listing identity and
 * delegates the client-side transition to Next.js without changing history
 * outside the router's normal `push` behavior.
 */
export function useListingNavigation() {
  const router = useRouter();

  const navigateToListing = (slug: string) => {
    router.push(routes.listings.detail(slug));
  };

  return { navigateToListing };
}
