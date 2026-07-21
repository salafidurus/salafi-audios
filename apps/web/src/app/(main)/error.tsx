"use client";

import { useEffect } from "react";
import { Button } from "@/shared/components/Button";
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
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
