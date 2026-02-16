import { CollectionViewDto } from "@sd/api-client";
import Image from "next/image";
import React from "react";
import styles from "./collection-card.module.css";

interface CollectionCardProps {
  collection: CollectionViewDto;
  scholarSlug: string;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection, scholarSlug }) => {
  return (
    <a href={`/collections/${scholarSlug}/${collection.slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {collection.coverImageUrl ? (
          <Image
            src={collection.coverImageUrl}
            alt={collection.title}
            fill
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderText}>{collection.title.charAt(0)}</span>
          </div>
        )}
        {collection.status === "published" && <span className={styles.badge}>Published</span>}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{collection.title}</h3>
        {collection.description && <p className={styles.description}>{collection.description}</p>}
        <span className={styles.viewCollection}>View Collection</span>
      </div>
    </a>
  );
};
