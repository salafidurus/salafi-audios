import type { ReactNode } from "react";
import styles from "./card-grid.module.css";

export function CardGrid({ children }: { children: ReactNode }) {
  return <ul className={styles["catalog-card-grid"]}>{children}</ul>;
}
