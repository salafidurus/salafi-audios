import type { ReactNode } from "react";
import styles from "./section-block.module.css";

type SectionBlockProps = {
  title: string;
  children: ReactNode;
};

export function SectionBlock({ title, children }: SectionBlockProps) {
  return (
    <section className={styles["catalog-section-block"]}>
      <div className={styles["catalog-section-heading"]}>
        <h2 className={styles["catalog-section-title"]}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
