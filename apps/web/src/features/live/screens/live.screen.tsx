import type { Metadata } from "next";
import { canonical } from "@/features/library/utils/seo";
import styles from "./live.screen.module.css";

export function getLiveMetadata(): Metadata {
  return {
    title: "Live",
    description: "Live lessons from scholars on Telegram and YouTube.",
    alternates: {
      canonical: canonical("/live"),
    },
  };
}

export function LiveScreen() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div>
          <h1 className={styles.title}>Live</h1>
          <p className={styles.subtitle}>
            Ongoing live lessons from our scholars, streamed on Telegram and YouTube.
          </p>
        </div>

        <section className={styles.notice}>
          <p className={styles.noticeTitle}>Dev mode</p>
          <p className={styles.noticeBody}>
            Live lesson listings will appear here once the integration bot is online.
          </p>
        </section>
      </div>
    </main>
  );
}
