"use client";

import { useEffect } from "react";
import styles from "./error.module.css";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function MainError({ error, reset }: ErrorProps) {
  useEffect(() => {
    error satisfies Error;
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Something went wrong</h2>
        <p className={styles.description}>This section could not be loaded. Please try again.</p>
        <button type="button" className={styles.button} onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
