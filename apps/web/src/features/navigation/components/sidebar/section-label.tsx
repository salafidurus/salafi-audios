import React from "react";

import styles from "./sidebar.module.css";

/** Documents a navigation group without adding an interactive control. */
interface SectionLabelProps {
  children: React.ReactNode;
}

/** Renders the non-interactive label used to separate navigation groups. */
export function SectionLabel({ children }: SectionLabelProps) {
  return <div className={styles.sectionLabel}>{children}</div>;
}
