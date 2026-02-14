import Link from "next/link";
import styles from "./scholar-avatar-card.module.css";

type ScholarAvatarCardProps = {
  href?: string;
  name: string;
  subtitle?: string;
  featured?: boolean;
};

export function ScholarAvatarCard({
  href,
  name,
  subtitle,
  featured = false,
}: ScholarAvatarCardProps) {
  const initial = name.charAt(0).toUpperCase();

  const content = (
    <>
      <div className={featured ? styles.avatarFeatured : styles.avatar}>{initial}</div>
      <p className={styles.name}>{name}</p>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </>
  );

  if (!href) {
    return <article className={styles.cardStatic}>{content}</article>;
  }

  return (
    <Link href={href} className={styles.card}>
      {content}
    </Link>
  );
}
