import { CollectionViewDto } from "@sd/contracts";
import Image from "next/image";
import Link from "next/link";
import styles from "./collection-card.module.css";

interface CollectionCardProps {
  collection: CollectionViewDto;
  scholarSlug: string;
}

export function CollectionCard({ collection, scholarSlug }: CollectionCardProps) {
  return (
    <Link href={`/collections/${scholarSlug}/${collection.slug}`} className={styles.card}>
      <div className={styles.coverContainer}>
        {collection.coverImageUrl ? (
          <Image
            src={collection.coverImageUrl}
            alt={collection.title}
            fill
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            <span>{collection.title.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{collection.title}</h3>
        {collection.description ? (
          <p className={styles.description}>{collection.description}</p>
        ) : null}
        <div className={styles.footer}>
          <span className={styles.seriesCount} />
          <span className={styles.viewLink}>View Collection</span>
        </div>
      </div>
    </Link>
  );
}
