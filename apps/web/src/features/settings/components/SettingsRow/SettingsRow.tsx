import type { ReactNode } from "react";
import styles from "./settings-row.module.css";

export interface SettingsRowProps {
  label: string;
  sublabel?: string;
  children?: ReactNode;
  /** If true, renders just a full-width child (no label column) */
  fullWidth?: boolean;
}

export function SettingsRow({ label, sublabel, children, fullWidth = false }: SettingsRowProps) {
  if (fullWidth) {
    return <div className={styles.rowFull}>{children}</div>;
  }

  return (
    <div className={styles.row}>
      <div className={styles.labelGroup}>
        <span className={styles.label}>{label}</span>
        {sublabel && <span className={styles.sublabel}>{sublabel}</span>}
      </div>
      {children && <div className={styles.control}>{children}</div>}
    </div>
  );
}
