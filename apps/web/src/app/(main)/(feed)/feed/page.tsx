import type { Metadata } from "next";
import { FeedScreen } from "@/features/feed/screens/feed.screen";

export const metadata: Metadata = {
  title: "Feed",
  description: "Your personalized feed of Islamic lectures and content.",
};

export default function FeedPage() {
  return <FeedScreen />;
}
