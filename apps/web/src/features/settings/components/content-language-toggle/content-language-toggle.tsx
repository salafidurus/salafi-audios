"use client";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  setShowOriginalContent,
  useShowOriginalContent,
} from "@/features/settings/content-preference";
import styles from "./content-language-toggle.module.css";

/** Settings toggle that switches catalogue content (lectures, series,
 * collections) between the selected language and its original language. */
export function ContentLanguageToggle() {
  const { t } = useTranslation();
  const showOriginal = useShowOriginalContent();

  return (
    <label className={styles.label}>
      <input
        type="checkbox"
        checked={showOriginal}
        onChange={(event) => setShowOriginalContent(event.target.checked)}
      />
      <span className={styles.labelText}>
        {t("account.showOriginalContent", "Show content in its original language")}
      </span>
    </label>
  );
}
