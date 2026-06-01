import type { Metadata } from "next";
import { LiveScheduledScreen } from "@/features/live/screens/live-scheduled.screen";

export const metadata: Metadata = {
  title: "Scheduled Livestreams",
  description: "Upcoming live Islamic lectures and events.",
};

export default function LiveScheduledPage() {
  return <LiveScheduledScreen />;
}
