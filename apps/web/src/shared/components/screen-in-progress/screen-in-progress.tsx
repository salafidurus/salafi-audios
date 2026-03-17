"use client";

import { ScreenInProgress as MobileScreenInProgress } from "@sd/ui-mobile";
import { useResponsive } from "@/shared/hooks/use-responsive";
import styles from "@/shared/components/screen-in-progress/screen-in-progress.module.css";

type ScreenInProgressProps = {
  title?: string;
  description?: string;
};

export function ScreenInProgress({
  title = "Screen in progress",
  description = "We are building this experience. Please check back soon.",
}: ScreenInProgressProps) {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile || isTablet) {
    return <MobileScreenInProgress />;
  }

  return (
    <section className={styles.wrapper} aria-label={title}>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.description}>{description}</p>
      </div>
    </section>
  );
}
