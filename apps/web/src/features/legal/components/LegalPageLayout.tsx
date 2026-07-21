"use client";

import { TableOfContents } from "./TableOfContents";
import styles from "./legal-page-layout.module.css";

interface Section {
  id: string;
  title: string;
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  introduction: string;
  sections: Section[];
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  introduction,
  sections,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className={styles.wrapper}>
      <TableOfContents sections={sections} />
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.lastUpdated}>{lastUpdated}</p>
        <p className={styles.introduction}>{introduction}</p>
        {children}
      </div>
    </div>
  );
}
