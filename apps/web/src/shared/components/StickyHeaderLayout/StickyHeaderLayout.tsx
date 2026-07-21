import type { ReactNode } from "react";
import styles from "./sticky-header-layout.module.css";

interface StickyHeaderLayoutProps {
  children: ReactNode;
}

function StickyHeaderLayoutRoot({ children }: StickyHeaderLayoutProps) {
  return <>{children}</>;
}

interface HeaderProps {
  children: ReactNode;
}

function Header({ children }: HeaderProps) {
  return <div className={styles.stickyHeader}>{children}</div>;
}

interface ContentProps {
  children: ReactNode;
}

function Content({ children }: ContentProps) {
  return <section className={styles.results}>{children}</section>;
}

export const StickyHeaderLayout = Object.assign(StickyHeaderLayoutRoot, {
  Header,
  Content,
});
