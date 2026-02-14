import Link from "next/link";
import type { RecommendationItem } from "@/features/home/types/home.types";
import styles from "./card.module.css";

const kindLabels: Record<RecommendationItem["kind"], string> = {
  lecture: "Lecture",
  series: "Series",
  collection: "Collection",
};

type CardProps = {
  item: RecommendationItem;
};

export function RecommendationCard({ item }: CardProps) {
  const content = (
    <>
      <div
        className={styles.cover}
        style={item.coverImageUrl ? { backgroundImage: `url(${item.coverImageUrl})` } : undefined}
      >
        <span className={styles.typeChip}>{kindLabels[item.kind]}</span>
      </div>
      <div className={styles.body}>
        <p className={styles.title}>{item.title}</p>
        <p className={styles.subtitle}>{item.subtitle}</p>
        {item.meta ? <p className={styles.meta}>{item.meta}</p> : null}
      </div>
    </>
  );

  return (
    <Link href={item.href} className={styles.card} role="listitem">
      {content}
    </Link>
  );
}
