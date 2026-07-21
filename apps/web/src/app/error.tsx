"use client";

import { useEffect } from "react";
import Link from "next/link";
import { routes } from "@sd/core-contracts";
import { Button } from "@/shared/components/Button";
import styles from "./error.module.css";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // noop: we could wire reporting later
    error satisfies Error;
  }, [error]);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.kicker}>500</p>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.description}>
          The page could not be loaded right now. Please try again.
        </p>
        <div className={styles.actions}>
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <Link href={routes.home} className={styles.link}>
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
