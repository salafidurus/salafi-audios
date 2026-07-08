"use client";

import Link from "next/link";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { SettingsSection } from "@/shared/components/SettingsSection/SettingsSection";
import { SettingsRow } from "@/shared/components/SettingsRow/SettingsRow";
import styles from "./settings-legal.screen.module.css";

export function SettingsLegalScreen() {
  return (
    <ScreenView>
      <PageHeader title="Legal" />

      <SettingsSection title="Privacy Policy" description="How we collect and use your data.">
        <SettingsRow
          label="Privacy Policy"
          sublabel="Read our full privacy policy, including data collection, storage, and your rights."
        >
          <Link href="/privacy" className={styles.linkButton}>
            View →
          </Link>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Terms of Use" description="Rules governing use of this service.">
        <SettingsRow
          label="Terms of Use"
          sublabel="Read the terms and conditions governing your use of Salafi Durus."
        >
          <Link href="/terms-of-use" className={styles.linkButton}>
            View →
          </Link>
        </SettingsRow>
      </SettingsSection>
    </ScreenView>
  );
}
