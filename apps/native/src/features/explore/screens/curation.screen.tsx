import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenInProgress } from "@/shared/components/ScreenInProgress/ScreenInProgress";

/** Composes native explore and catalog surfaces for browsing available content. */
/** Renders the native curation screen surface and coordinates its user-facing state. */
export function CurationScreen() {
  const { t } = useTranslation();

  return <ScreenInProgress description={t("explore.curation.description", "Coming soon")} />;
}
