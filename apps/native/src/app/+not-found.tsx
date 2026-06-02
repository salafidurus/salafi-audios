import { Stack } from "expo-router";
import { PlaceholderRouteScreen } from "../shared/components/placeholder-route-screen";

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
