import type { Metadata } from "next";
import { LiveEndedScreen } from "@/features/live/screens/live-ended.screen";

export const metadata: Metadata = {
  title: "Past Livestreams",
  description: "Recordings of past live Islamic lectures and events.",
};

export default function LiveEndedPage() {
  return <LiveEndedScreen />;
}
