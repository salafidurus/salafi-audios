import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenInProgress } from "@/shared/components/ScreenInProgress/ScreenInProgress";

/** Provides the native features explore screens curation.screen module responsibility. */
/** Describes the CurationScreen native function contract and behavior. */
export function CurationScreen() {
  const { t } = useTranslation();

  return <ScreenInProgress description={t("explore.curation.description", "Coming soon")} />;
}
