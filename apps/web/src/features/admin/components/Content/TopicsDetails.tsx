import type { TopicDetailDto } from "@sd/core-contracts";
import styles from "./Content.module.css";

export function TopicsDetails({ topic }: { topic: TopicDetailDto }) {
  return (
    <div className={styles.topicDetails}>
      <div className={styles.topicSlug}>{topic.slug}</div>
      <div className={styles.translationsList}>
        <span className={styles.translationItem}>
          <strong>EN:</strong> {topic.name.en}
        </span>
        <span className={styles.translationItem}>
          <strong>AR:</strong> {topic.name.ar || "No translation"}
        </span>
      </div>
    </div>
  );
}
