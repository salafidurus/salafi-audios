import Link from "next/link";
import styles from "./scholar-avatar-card.module.css";

type ScholarAvatarCardProps = {
  href?: string;
  name: string;
  subtitle?: string;
  featured?: boolean;
  size?: "md" | "lg";
  showInitial?: boolean;
  actionLabel?: string;
  actionDisabled?: boolean;
  actionTitle?: string;
};

export function ScholarAvatarCard({
  href,
  name,
  subtitle,
  featured = false,
  size = "md",
  showInitial = true,
  actionLabel,
  actionDisabled = false,
  actionTitle,
}: ScholarAvatarCardProps) {
  const initial = name.charAt(0).toUpperCase();
  const cardClass = size === "lg" ? styles.cardLarge : styles.card;
  const avatarClass = featured
    ? size === "lg"
      ? styles.avatarFeaturedLarge
      : styles.avatarFeatured
    : size === "lg"
      ? styles.avatarLarge
      : styles.avatar;
  const nameClass = size === "lg" ? styles.nameLarge : styles.name;

  const content = (
    <>
      <div className={avatarClass}>{showInitial ? initial : null}</div>
      <p className={nameClass}>{name}</p>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      {actionLabel ? (
        <button
          type="button"
          className={styles.action}
          disabled={actionDisabled}
          aria-disabled={actionDisabled}
          title={actionTitle}
        >
          {actionLabel}
        </button>
      ) : null}
    </>
  );

  if (!href) {
    return <article className={`${styles.cardStatic} ${cardClass}`.trim()}>{content}</article>;
  }

  return (
    <Link href={href} className={cardClass}>
      {content}
    </Link>
  );
}
