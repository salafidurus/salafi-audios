import { type Href, useRouter } from "expo-router";
import { routes } from "@sd/core-contracts";
import { LiveScheduledScreen } from "@/features/live/screens/live-scheduled.screen";

export default function LiveScheduled() {
  const router = useRouter();

  return (
    <LiveScheduledScreen
      onNavigateToSession={(id) => router.push(routes.live.session(id) as Href)}
    />
  );
}
