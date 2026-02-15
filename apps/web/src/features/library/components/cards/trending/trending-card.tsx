import styles from "./trending-card.module.css";

type TrendingCardProps = {
  rank: number;
  title: string;
  scholarName: string;
  plays: string;
  coverImageUrl?: string;
};

export function TrendingCard({
  rank,
  title,
  scholarName,
  plays,
  coverImageUrl,
}: TrendingCardProps) {
  return (
    <article className={styles.card}>
      <span className={styles.rank}>#{rank}</span>
      <div
        className={styles.cover}
        style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})` } : undefined}
      ></div>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.subtitle}>{scholarName}</p>
        <p className={styles.plays}>{plays}</p>
      </div>
    </article>
  );
}
