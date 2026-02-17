import Link from "next/link";
import { Bookmark } from "lucide-react";
import styles from "./scholar-avatar-card.module.css";

type ScholarAvatarCardProps = {
  href?: string;
  name: string;
  subtitle?: string;
  featured?: boolean;
  size?: "md" | "lg";
  showInitial?: boolean;
  imageUrl?: string;
  actionLabel?: string;
  actionDisabled?: boolean;
  actionTitle?: string;
  showBio?: boolean;
  bioText?: string;
  showFollowButton?: boolean;
};

export function ScholarAvatarCard({
  href,
  name,
  subtitle,
  featured = false,
  size = "md",
  showInitial = true,
  imageUrl,
  actionLabel,
  actionDisabled = false,
  actionTitle,
  showBio = false,
  bioText,
  showFollowButton = false,
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
      {showFollowButton && (
        <button
          type="button"
          className={styles.followButton}
          aria-label="Bookmark scholar"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Bookmark size={18} />
        </button>
      )}
      <div className={avatarClass}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className={styles.avatarImage}
            width={size === "lg" ? 176 : 88}
            height={size === "lg" ? 220 : 88}
          />
        ) : showInitial ? (
          initial
        ) : null}
      </div>
      <p className={nameClass}>{name}</p>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      {showBio && bioText ? <p className={styles.bioPreview}>{bioText}</p> : null}
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
