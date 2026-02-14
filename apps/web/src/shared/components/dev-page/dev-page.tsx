import Link from "next/link";
import styles from "./dev-page.module.css";

type DevPageProps = {
  title: string;
  description?: string;
};

export function DevPage({ title, description }: DevPageProps) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.kicker}>In development mode</p>
        <h1 className={styles.title}>{title}</h1>
        {description ? <p className={styles.description}>{description}</p> : null}
        <Link href="/" className={styles.link}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
