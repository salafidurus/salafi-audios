import { Stack } from "expo-router";

import { PlaceholderRouteScreen } from "../shared/components/placeholder-route-screen";

/** Defines the Expo Router entrypoint for the native +not-found route and delegates behavior to the feature layer. */
/** Renders the native not found screen surface and coordinates its user-facing state. */
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
