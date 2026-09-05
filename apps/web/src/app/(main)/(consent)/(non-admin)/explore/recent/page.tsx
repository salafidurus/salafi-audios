import type { Metadata } from "next";

import { FeedRecentScreen } from "@/features/explore/screens/explore-recent.screen";

/** Documents this module's responsibility and public boundary. */
/** Static metadata for the public recent-listings route. */
export const metadata: Metadata = {
  title: "Recent Listings",
  description: "Browse all recent Islamic lectures and content.",
};

/** Renders the ordered recent-listings Explore surface. */
export default function ExploreRecentPage() {
  return <FeedRecentScreen />;
}
