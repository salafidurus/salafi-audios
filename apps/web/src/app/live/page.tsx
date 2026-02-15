import type { Metadata } from "next";
import { getLiveMetadata, LiveScreen } from "@/features/live/screens/live.screen";

export const metadata: Metadata = getLiveMetadata();

export default function LivePage() {
  return <LiveScreen />;
}
