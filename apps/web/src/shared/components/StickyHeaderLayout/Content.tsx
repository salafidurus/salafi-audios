import type { ReactNode } from "react";
import styles from "./sticky-header-layout.module.css";

interface ContentProps {
  children: ReactNode;
}

export function Content({ children }: ContentProps) {
  return <section className={styles.results}>{children}</section>;
}
