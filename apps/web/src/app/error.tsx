/** Renders a provider-independent recovery page when the application shell fails. */
"use client";

import styles from "./error.module.css";

type ErrorProps = {
  /** Framework error retained for logging or diagnostics by the boundary. */
  error: Error & { digest?: string };
  reset: () => void;
};

/** Renders a provider-independent recovery page when the application shell fails. */
export default function Error({ error, reset }: ErrorProps) {
  // Keep the last-resort boundary independent from the application runtime.
  void error;
  void reset;

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.brand}>Salafi Durus</p>
        <p className={styles.kicker}>404</p>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.description}>The page could not be loaded right now.</p>
        <div className={styles.actions}>
          {/* react-doctor-disable-next-line react-doctor/nextjs-no-a-element -- native recovery link must survive router/provider failures */}
          <a href="/" className={styles.link}>
            Back to home
          </a>
          <button type="button" className={styles.reload} onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      </div>
    </main>
  );
}
