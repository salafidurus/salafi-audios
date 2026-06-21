"use client";

import { useTranslation } from "@/core/i18n/use-translation";
import { setShowOriginalContent, useShowOriginalContent } from "@/features/i18n/content-preference";

/** Settings toggle that switches catalogue content (lectures, series,
 * collections) between the selected language and its original language. */
export function ContentLanguageToggle() {
  const { t } = useTranslation();
  const showOriginal = useShowOriginalContent();

  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={showOriginal}
        onChange={(event) => setShowOriginalContent(event.target.checked)}
      />
      <span style={{ fontSize: 14 }}>
        {t("account.showOriginalContent", "Show content in its original language")}
      </span>
    </label>
  );
}
