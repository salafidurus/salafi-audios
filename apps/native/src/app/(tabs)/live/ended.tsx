import { type Href, useRouter } from "expo-router";
import { routes } from "@sd/core-contracts";
import { LiveEndedScreen } from "@/features/live/screens/live-ended.screen";

export default function LiveEnded() {
  const router = useRouter();

  return (
    <LiveEndedScreen onNavigateToSession={(id) => router.push(routes.live.session(id) as Href)} />
  );
}
