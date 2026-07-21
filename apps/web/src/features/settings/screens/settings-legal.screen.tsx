"use client";

import Link from "next/link";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { SettingsSection } from "@/shared/components/SettingsSection/SettingsSection";
import { SettingsRow } from "@/shared/components/SettingsRow/SettingsRow";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./settings-legal.screen.module.css";

export function SettingsLegalScreen() {
  const { t } = useTranslation();

  return (
    <ScreenView>
      <PageHeader title={t("settings.legal.title", "Legal")} />

      <SettingsSection
        title={t("settings.legal.privacyPolicy", "Privacy Policy")}
        description={t("settings.legal.privacyDesc", "How we collect and use your data.")}
      >
        <SettingsRow
          label={t("settings.legal.privacyPolicy", "Privacy Policy")}
          sublabel={t(
            "settings.legal.privacySublabel",
            "Read our full privacy policy, including data collection, storage, and your rights.",
          )}
        >
          <Link href="/privacy" className={styles.linkButton}>
            {t("settings.legal.view", "View →")}
          </Link>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title={t("settings.legal.termsOfUse", "Terms of Use")}
        description={t("settings.legal.termsDesc", "Rules governing use of this service.")}
      >
        <SettingsRow
          label={t("settings.legal.termsOfUse", "Terms of Use")}
          sublabel={t(
            "settings.legal.termsSublabel",
            "Read the terms and conditions governing your use of Salafi Durus.",
          )}
        >
          <Link href="/terms-of-use" className={styles.linkButton}>
            {t("settings.legal.view", "View →")}
          </Link>
        </SettingsRow>
      </SettingsSection>
    </ScreenView>
  );
}
