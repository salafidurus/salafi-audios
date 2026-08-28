import React from "react";

import styles from "./sidebar.module.css";

/** Documents this module's responsibility and public boundary. */
interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return <div className={styles.sectionLabel}>{children}</div>;
}
