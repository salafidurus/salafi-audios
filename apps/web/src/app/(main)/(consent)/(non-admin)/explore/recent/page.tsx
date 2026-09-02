import type { Metadata } from "next";

import { FeedRecentScreen } from "@/features/explore/screens/explore-recent.screen";

/** Documents this module's responsibility and public boundary. */
export const metadata: Metadata = {
  title: "Recent Listings",
  description: "Browse all recent Islamic lectures and content.",
};

export default function ExploreRecentPage() {
  return <FeedRecentScreen />;
}
