import { useTranslation } from "@/core/i18n/use-translation";
import { PlaceholderRouteScreen } from "@/shared/components/placeholder-route-screen";

/** Defines the Home root entrypoint for the native listener-facing shell. */
/** Keeps the Home root reachable and localized while #814 supplies its study-specific content. */
export default function HomeRoute() {
  const { t } = useTranslation();

  return (
    <PlaceholderRouteScreen
      title={t("navigation.home", "Home")}
      description={t("home.description", "Begin your study journey.")}
    />
  );
}
