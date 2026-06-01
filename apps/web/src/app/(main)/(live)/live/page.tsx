import type { Metadata } from "next";
import { LiveScreen } from "@/features/live/screens/live.screen";

export const metadata: Metadata = {
  title: "Live",
  description: "Watch live Islamic lectures and events.",
};

export default function LivePage() {
  return <LiveScreen />;
}
