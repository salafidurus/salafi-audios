import type { RecommendationItem } from "@/features/home/types/home.types";
import { RecommendationCard } from "@/features/home/components/recommendations/card/card";
import styles from "./row.module.css";

type RowProps = {
  title: string;
  items: RecommendationItem[];
};

export function RecommendationRow({ title, items }: RowProps) {
  return (
    <section className={styles.row} aria-label={title}>
      <div className={styles.head}>
        <h2>{title}</h2>
      </div>
      {items.length === 0 ? (
        <div className={styles.empty}>No items yet.</div>
      ) : (
        <div className={styles.scroller} role="list">
          {items.map((item) => (
            <RecommendationCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
