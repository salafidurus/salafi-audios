"use client";

import styles from "./screen-in-progress.module.css";

type Props = {
  title?: string;
  description?: string;
};

export function ScreenInProgressDesktopWeb({
  title = "Screen in progress",
  description = "We are building this experience. Please check back soon.",
}: Props) {
  return (
    <section className={styles.wrapper} aria-label={title}>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.description}>{description}</p>
      </div>
    </section>
  );
}
