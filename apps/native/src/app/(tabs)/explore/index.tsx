import { routes } from "@sd/core-contracts";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";

import type { ExploreSub } from "@/features/explore/components/explore-sub-tab-pills/explore-sub-tab-pills";

import { ExploreScreen } from "@/features/explore/screens/explore-screen";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

export default function ExploreIndexRoute() {
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();

  // Accept optional deep-link params from other screens:
  //   /explore?sub=scholars          → open Scholars tab
  //   /explore?sub=all&topic=aqeedah → open All Lectures tab pre-filtered to Aqeedah
  const { sub, topic } = useLocalSearchParams<{ sub?: string; topic?: string }>();

  const VALID_SUBS: ExploreSub[] = ["all", "recent", "scholars", "curation"];
  const initialSub: ExploreSub =
    sub && VALID_SUBS.includes(sub as ExploreSub) ? (sub as ExploreSub) : "all";

  return (
    <ExploreScreen
      onNavigateToListing={navigateToListing}
      onNavigateToScholar={(slug) => router.push(routes.scholars.detail(slug) as Href)}
      initialSub={initialSub}
      initialTopicSlug={topic ?? undefined}
    />
  );
}
