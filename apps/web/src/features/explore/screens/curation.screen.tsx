/** Documents this module's responsibility and public boundary. */
"use client";

import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenInProgressResponsive } from "@/shared/components/ScreenInProgress/ScreenInProgress";

/** Renders the curated Explore recommendations with their loading and empty states. */
export function CurationScreen() {
  const { t } = useTranslation();

  return (
    <ScreenInProgressResponsive
      title={t("explore.curation.title", "Curation")}
      description={t("explore.curation.description", "Coming soon")}
    />
  );
}
