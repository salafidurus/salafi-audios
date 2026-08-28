import type { Metadata } from "next";

import { FeedRecentScreen } from "@/features/explore/screens/explore-recent.screen";

/** Defines the public exploration route. */
/** Supplies the title and description for recent content. */
export const metadata: Metadata = {
  title: "Recent",
  description: "Your personalized feed of recent Islamic lectures and content.",
};

/** Renders the recent feed screen for public exploration. */
export default function ExplorePage() {
  return <FeedRecentScreen />;
}
