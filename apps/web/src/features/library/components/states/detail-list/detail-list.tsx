import type { ReactNode } from "react";
import styles from "./detail-list.module.css";

export function DetailList({ children }: { children: ReactNode }) {
  return <dl className={styles.list}>{children}</dl>;
}

export function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className={styles.row}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value ?? "-"}</dd>
    </div>
  );
}
