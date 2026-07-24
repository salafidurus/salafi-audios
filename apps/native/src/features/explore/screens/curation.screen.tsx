import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenInProgress } from "@/shared/components/ScreenInProgress/ScreenInProgress";

export function CurationScreen() {
  const { t } = useTranslation();

  return (
    <ScreenInProgress
      title={t("explore.curation.title", "Curation")}
      description={t("explore.curation.description", "Coming soon")}
    />
  );
}
