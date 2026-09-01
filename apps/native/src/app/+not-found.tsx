import { Stack } from "expo-router";

import { useTranslation } from "@/core/i18n/use-translation";

import { PlaceholderRouteScreen } from "../shared/components/placeholder-route-screen";

/** Defines the Expo Router entrypoint for the native +not-found route and delegates behavior to the feature layer. */
/** Renders the native not found screen surface and coordinates its user-facing state. */
export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t("notFound.title", "Oops!") }} />
      <PlaceholderRouteScreen
        title={t("notFound.message", "Page not found")}
        description={t(
          "notFound.nativeDescription",
          "This route does not exist. Tap back in the app or return home.",
        )}
      />
    </>
  );
}
