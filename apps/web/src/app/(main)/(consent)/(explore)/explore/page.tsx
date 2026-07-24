import type { Metadata } from "next";
import { FeedRecentScreen } from "@/features/explore/screens/explore-recent.screen";

export const metadata: Metadata = {
  title: "Recent",
  description: "Your personalized feed of recent Islamic lectures and content.",
};

export default function ExplorePage() {
  return <FeedRecentScreen />;
}
