import type { ReactNode } from "react";
import styles from "./sticky-header-layout.module.css";

interface HeaderProps {
  children: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return <div className={styles.stickyHeader}>{children}</div>;
}
