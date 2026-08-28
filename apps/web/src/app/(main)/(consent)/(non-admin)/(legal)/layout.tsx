/** Documents this module's responsibility and public boundary. */
"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { TableOfContents } from "@/features/legal/components/TableOfContents";
import {
  COOKIE_SECTIONS,
  PRIVACY_SECTIONS,
  TERMS_SECTIONS,
} from "@/features/legal/constants/sections";

import styles from "./legal-layout.module.css";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const sections = pathname.includes("/privacy")
    ? PRIVACY_SECTIONS
    : pathname.includes("/cookie-policy")
      ? COOKIE_SECTIONS
      : TERMS_SECTIONS;

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#legal-document">
        {t("legal.skipToDocument", "Skip to document")}
      </a>
      <div className={styles.content}>{children}</div>
      <div className={styles.tocColumn}>
        <TableOfContents sections={sections} />
      </div>
    </div>
  );
}
