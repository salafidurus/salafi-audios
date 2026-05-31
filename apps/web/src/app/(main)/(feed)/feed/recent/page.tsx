import type { Metadata } from "next";
import { FeedRecentScreen } from "@/features/feed/screens/feed-recent.screen";

export const metadata: Metadata = {
  title: "Recent Lectures",
  description: "Browse the most recently added Islamic lectures.",
};

export default function FeedRecentPage() {
  return <FeedRecentScreen />;
}
