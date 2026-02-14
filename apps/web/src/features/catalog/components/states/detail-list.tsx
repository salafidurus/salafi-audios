import type { ReactNode } from "react";
import styles from "./detail-list.module.css";

export function DetailList({ children }: { children: ReactNode }) {
  return <dl className={styles["catalog-detail-list"]}>{children}</dl>;
}

export function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className={styles["catalog-detail-row"]}>
      <dt className={styles["catalog-detail-label"]}>{label}</dt>
      <dd className={styles["catalog-detail-value"]}>{value ?? "-"}</dd>
    </div>
  );
}
