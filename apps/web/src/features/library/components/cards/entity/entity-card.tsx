import Link from "next/link";
import styles from "./entity-card.module.css";

type EntityCardProps = {
  href: string;
  title: string;
  description?: string;
  meta?: string;
  coverImageUrl?: string;
  tag?: string;
};

export function EntityCard({
  href,
  title,
  description,
  meta,
  coverImageUrl,
  tag,
}: EntityCardProps) {
  return (
    <li className={styles.cardItem}>
      <Link href={href} className={styles.card}>
        {coverImageUrl || tag ? (
          <div className={styles.coverWrap}>
            {coverImageUrl ? (
              <div
                className={styles.cover}
                style={{ backgroundImage: `url(${coverImageUrl})` }}
                aria-hidden="true"
              />
            ) : (
              <div className={styles.coverPlaceholder} aria-hidden="true" />
            )}
            {tag ? <span className={styles.tag}>{tag}</span> : null}
          </div>
        ) : null}
        <div className={styles.body}>
          <h3 className={styles.title}>{title}</h3>
          {description ? <p className={styles.description}>{description}</p> : null}
          <div className={styles.footer}>
            {meta ? (
              <p className={styles.meta}>{meta}</p>
            ) : (
              <span className={styles.meta}>Library page</span>
            )}
            <span className={styles.cta}>View</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
