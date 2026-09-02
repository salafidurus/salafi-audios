/** Documents this module's responsibility and public boundary. */
"use client";

import { getLegalDocument } from "@sd/domain-legal";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { TableOfContents } from "@/features/legal/components/TableOfContents";

import styles from "./legal-layout.module.css";

/** Selects the shared legal document metadata that drives the desktop contents navigation. */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const documentId = pathname.includes("/privacy")
    ? "privacy"
    : pathname.includes("/cookie-policy")
      ? "cookies"
      : "terms";
  const document = getLegalDocument(documentId);
  const sections =
    document?.sections.map((section) => ({
      id: section.id,
      title: section.heading.en,
    })) ?? [];

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
