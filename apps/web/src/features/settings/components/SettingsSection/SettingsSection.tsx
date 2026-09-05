import type { ReactNode } from "react";

import styles from "./settings-section.module.css";

/** Documents this module's responsibility and public boundary. */
/** Content and heading data for a grouped settings section. */
export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Renders a titled group of settings rows with an optional description. */
export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.rows}>{children}</div>
    </section>
  );
}
