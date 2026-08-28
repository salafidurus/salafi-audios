import { Stack } from "expo-router";

import { PlaceholderRouteScreen } from "../shared/components/placeholder-route-screen";

/** Provides the native app +not-found module responsibility. */
/** Describes the NotFoundScreen native function contract and behavior. */
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <PlaceholderRouteScreen
        title="Page not found"
        description="This native route has not been migrated yet. Tap back in the app or return home."
      />
    </>
  );
}
