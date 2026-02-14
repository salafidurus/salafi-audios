import type { ReactNode } from "react";
import styles from "./section-block.module.css";

type SectionBlockProps = {
  title: string;
  children: ReactNode;
};

export function SectionBlock({ title, children }: SectionBlockProps) {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <h2 className={styles.title}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
