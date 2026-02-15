import type { ReactNode } from "react";
import styles from "./grid.module.css";

export function CardGrid({ children }: { children: ReactNode }) {
  return <ul className={styles.cardGrid}>{children}</ul>;
}
