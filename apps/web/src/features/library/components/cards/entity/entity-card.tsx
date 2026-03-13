import Link from "next/link";
import styles from "./entity-card.module.css";

const FALLBACK_IMAGE = "/dev-mock/template-4-to-5-image.jpg";

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
  const imageUrl = coverImageUrl || FALLBACK_IMAGE;

  return (
    <li className={styles.cardItem}>
      <Link href={href} className={styles.card}>
        <div className={styles.coverWrap}>
          <div
            className={styles.cover}
            style={{ backgroundImage: `url(${imageUrl})` }}
            aria-hidden="true"
          />
          {tag ? <span className={styles.tag}>{tag}</span> : null}
        </div>
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
