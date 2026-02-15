import Link from "next/link";
import styles from "./entity-card.module.css";

type EntityCardProps = {
  href: string;
  title: string;
  description?: string;
  meta?: string;
};

export function EntityCard({ href, title, description, meta }: EntityCardProps) {
  return (
    <li className={styles.cardItem}>
      <Link href={href} className={styles.card}>
        <h3 className={styles.title}>{title}</h3>
        {description ? <p className={styles.description}>{description}</p> : null}
        <div className={styles.footer}>
          {meta ? (
            <p className={styles.meta}>{meta}</p>
          ) : (
            <span className={styles.meta}>Library page</span>
          )}
          <span className={styles.cta}>Open</span>
        </div>
      </Link>
    </li>
  );
}
