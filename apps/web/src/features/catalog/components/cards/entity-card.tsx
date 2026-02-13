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
    <li className={styles["catalog-card-item"]}>
      <Link href={href} className={styles["catalog-entity-card"]}>
        <h3 className={styles["catalog-card-title"]}>{title}</h3>
        {description ? <p className={styles["catalog-card-description"]}>{description}</p> : null}
        <div className={styles["catalog-card-footer"]}>
          {meta ? (
            <p className={styles["catalog-card-meta"]}>{meta}</p>
          ) : (
            <span className={styles["catalog-card-meta"]}>Catalog page</span>
          )}
          <span className={styles["catalog-card-cta"]}>Open</span>
        </div>
      </Link>
    </li>
  );
}
