import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.kicker}>404</p>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.description}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className={styles.link}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
