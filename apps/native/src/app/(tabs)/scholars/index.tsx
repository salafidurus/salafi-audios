import { useTranslation } from "@/core/i18n/use-translation";
import { PlaceholderRouteScreen } from "@/shared/components/placeholder-route-screen";

/** Defines the Scholars root entrypoint for the native listener-facing shell. */
/** Keeps the Scholars root present and localized while #815 supplies its dedicated destination. */
export default function ScholarsRoute() {
  const { t } = useTranslation();

  return (
    <PlaceholderRouteScreen
      title={t("navigation.scholars", "Scholars")}
      description={t("scholarContent.description", "Explore our scholars.")}
    />
  );
}
