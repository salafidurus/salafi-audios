import Link from "next/link";
import styles from "./lecture-media-card.module.css";

type LectureMediaCardProps = {
  href?: string;
  title: string;
  subtitle: string;
  tag?: string;
  duration?: string;
  coverImageUrl?: string;
};

export function LectureMediaCard({
  href,
  title,
  subtitle,
  tag,
  duration,
  coverImageUrl,
}: LectureMediaCardProps) {
  const content = (
    <>
      <div
        className={styles.cover}
        style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})` } : undefined}
      >
        <div className={styles.playButton}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {duration ? <span className={styles.duration}>{duration}</span> : null}
      </div>
      <p className={styles.title}>{title}</p>
      <p className={styles.subtitle}>{subtitle}</p>
      {tag ? <span className={styles.tag}>{tag}</span> : null}
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
