import React from "react";
import styles from "./sidebar.module.css";

interface SectionLabelProps {
  children: React.ReactNode;
  collapsed?: boolean;
}

export function SectionLabel({ children, collapsed }: SectionLabelProps) {
  if (collapsed) {
    return null;
  }
  return <div className={styles.sectionLabel}>{children}</div>;
}
